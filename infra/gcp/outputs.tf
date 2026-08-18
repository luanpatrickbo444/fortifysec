output "gateway_public_ip" { value = google_compute_address.gateway.address }
output "gateway_internal_ip" { value = google_compute_instance.gateway.network_interface[0].network_ip }
output "gateway_service_account" { value = google_service_account.gateway.email }
output "gcp_network" { value = "global/networks/${google_compute_network.range.name}" }
output "gcp_subnetwork" { value = "regions/${var.region}/subnetworks/${google_compute_subnetwork.labs.name}" }
