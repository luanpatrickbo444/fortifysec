provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

resource "google_project_service" "compute" {
  service            = "compute.googleapis.com"
  disable_on_destroy = false
}

resource "google_compute_network" "range" {
  name                    = "fortify-range"
  auto_create_subnetworks = false
  routing_mode            = "REGIONAL"
  depends_on              = [google_project_service.compute]
}

resource "google_compute_subnetwork" "gateway" {
  name          = "fortify-range-gateway"
  ip_cidr_range = "10.80.0.0/24"
  region        = var.region
  network       = google_compute_network.range.id
  private_ip_google_access = false
}

resource "google_compute_subnetwork" "labs" {
  name          = "fortify-labs"
  ip_cidr_range = "10.80.16.0/20"
  region        = var.region
  network       = google_compute_network.range.id
  private_ip_google_access = false
}

resource "google_service_account" "gateway" {
  account_id   = "fortify-range-gateway"
  display_name = "FortifySec Range Gateway"
}

resource "google_project_iam_member" "gateway_instance_admin" {
  project = var.project_id
  role    = "roles/compute.instanceAdmin.v1"
  member  = "serviceAccount:${google_service_account.gateway.email}"
}

resource "google_project_iam_member" "gateway_network_user" {
  project = var.project_id
  role    = "roles/compute.networkUser"
  member  = "serviceAccount:${google_service_account.gateway.email}"
}

resource "google_compute_address" "gateway" {
  name   = "fortify-range-gateway-ip"
  region = var.region
}

resource "google_compute_instance" "gateway" {
  name         = "fortify-range-01"
  machine_type = var.gateway_machine_type
  zone         = var.zone
  can_ip_forward = true
  tags         = ["fortify-range-gateway"]

  boot_disk {
    initialize_params {
      image = var.gateway_image
      size  = 30
      type  = "pd-balanced"
    }
  }

  network_interface {
    network    = google_compute_network.range.id
    subnetwork = google_compute_subnetwork.gateway.id
    access_config {
      nat_ip = google_compute_address.gateway.address
    }
  }

  service_account {
    email  = google_service_account.gateway.email
    scopes = ["cloud-platform"]
  }

  metadata = {
    enable-oslogin = "TRUE"
  }

  labels = {
    role = "fortify-range-gateway"
  }
}

# Route used by private lab VMs to return traffic to WireGuard clients.
resource "google_compute_route" "vpn_clients" {
  name                   = "fortify-vpn-clients"
  network                = google_compute_network.range.name
  dest_range             = "10.77.0.0/16"
  priority               = 800
  next_hop_instance      = google_compute_instance.gateway.name
  next_hop_instance_zone = var.zone
}

resource "google_compute_firewall" "wireguard" {
  name    = "fortify-allow-wireguard"
  network = google_compute_network.range.name
  direction = "INGRESS"
  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["fortify-range-gateway"]
  allow { protocol = "udp"; ports = ["51820"] }
}

resource "google_compute_firewall" "provider_https" {
  name    = "fortify-allow-provider-https"
  network = google_compute_network.range.name
  direction = "INGRESS"
  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["fortify-range-gateway"]
  allow { protocol = "tcp"; ports = ["443"] }
}

resource "google_compute_firewall" "iap_ssh" {
  name    = "fortify-allow-iap-ssh"
  network = google_compute_network.range.name
  direction = "INGRESS"
  source_ranges = ["35.235.240.0/20"]
  target_tags   = ["fortify-range-gateway"]
  allow { protocol = "tcp"; ports = ["22"] }
}

# Lab VMs have no public IP. Only traffic arriving from the WireGuard client subnet is accepted.
resource "google_compute_firewall" "vpn_to_labs" {
  name    = "fortify-allow-vpn-to-labs"
  network = google_compute_network.range.name
  direction = "INGRESS"
  source_ranges = ["10.77.0.0/16"]
  target_tags   = ["fortify-lab"]
  allow { protocol = "tcp" }
  allow { protocol = "udp" }
  allow { protocol = "icmp" }
}
