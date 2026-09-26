export type PlanId = "basico" | "completo" | "premium";

export type Enrollment = {
  name: string;
  email: string;
  plan: PlanId;
  enrolledAt: string;
};

const KEY = "fortify-enrollment";

export const PLANS: Record<
  PlanId,
  { name: string; price: string; installments: string; features: string[] }
> = {
  basico: {
    name: "Básico",
    price: "R$ 1.997",
    installments: "ou 12x de R$ 197",
    features: [
      "Acesso à grade completa",
      "Labs práticos",
      "Certificado de conclusão",
      "Acesso por 12 meses",
    ],
  },
  completo: {
    name: "Completo",
    price: "R$ 2.997",
    installments: "ou 12x de R$ 297",
    features: [
      "Tudo do Básico",
      "Acesso vitalício",
      "Comunidade exclusiva",
      "Atualizações futuras",
      "Mentoria em grupo",
    ],
  },
  premium: {
    name: "Premium",
    price: "R$ 3.997",
    installments: "ou 12x de R$ 397",
    features: [
      "Tudo do Completo",
      "Mentoria 1:1 (4 sessões)",
      "Revisão de projetos",
      "Kit certificado físico",
      "Banco de talentos",
    ],
  },
};

export function readEnrollment(): Enrollment | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Enrollment;
  } catch {
    return null;
  }
}

export function saveEnrollment(data: Enrollment) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function clearEnrollment() {
  localStorage.removeItem(KEY);
}
