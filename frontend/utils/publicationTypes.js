export const DEFAULT_PUBLICATION_TYPE = "projeto";

export const PUBLICATION_TYPES = [
  { value: "projeto", label: "Projeto" },
  { value: "ideia", label: "Ideia" },
  { value: "prototipo", label: "Prototipo" },
  { value: "design", label: "Design" },
  { value: "codigo", label: "Codigo" },
  { value: "print", label: "Print" },
  { value: "video-curto", label: "Video curto" },
  { value: "atualizacao", label: "Atualizacao" },
  { value: "bug-corrigido", label: "Bug corrigido" },
  { value: "antes-e-depois", label: "Antes e depois" },
  { value: "pedido-feedback", label: "Pedido de feedback" },
  { value: "vaga-freela", label: "Vaga/freela" },
];

export function getPublicationTypeLabel(value) {
  return PUBLICATION_TYPES.find((type) => type.value === value)?.label || "Projeto";
}
