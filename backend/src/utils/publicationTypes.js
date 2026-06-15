export const DEFAULT_PUBLICATION_TYPE = 'projeto';

export const PUBLICATION_TYPES = [
  { value: 'projeto', label: 'Projeto' },
  { value: 'ideia', label: 'Ideia' },
  { value: 'prototipo', label: 'Prototipo' },
  { value: 'design', label: 'Design' },
  { value: 'codigo', label: 'Codigo' },
  { value: 'print', label: 'Print' },
  { value: 'video-curto', label: 'Video curto' },
  { value: 'atualizacao', label: 'Atualizacao' },
  { value: 'bug-corrigido', label: 'Bug corrigido' },
  { value: 'antes-e-depois', label: 'Antes e depois' },
  { value: 'pedido-feedback', label: 'Pedido de feedback' },
  { value: 'vaga-freela', label: 'Vaga/freela' },
];

const aliases = new Map(
  PUBLICATION_TYPES.flatMap((type) => [
    [type.value, type.value],
    [normalizeType(type.label), type.value],
  ])
);

function normalizeType(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' e ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function normalizePublicationType(value) {
  const normalized = normalizeType(value);
  return aliases.get(normalized) || DEFAULT_PUBLICATION_TYPE;
}

export function getPublicationTypeLabel(value) {
  const normalized = normalizePublicationType(value);
  return PUBLICATION_TYPES.find((type) => type.value === normalized)?.label || 'Projeto';
}
