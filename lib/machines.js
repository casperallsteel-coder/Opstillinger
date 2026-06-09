// lib/machines.js
// Maskinskabeloner - tilføj nye maskiner her

export const machineTemplates = {
  'Kantpresse': {
    icon: '🔧',
    color: '#C81F27',
    fields: [
      { name: 'materiale',   label: 'Materiale',              type: 'select',   options: ['Stål (DC01)', 'Varmgalvaniseret', 'Rustfri stål (304)', 'Rustfri stål (316)', 'Aluminium', 'Kobber', 'Messing'] },
      { name: 'tykkelse',    label: 'Tykkelse (mm)',           type: 'number',   placeholder: 'F.eks. 2.0' },
      { name: 'tonnage',     label: 'Tonnage (ton)',           type: 'number',   placeholder: 'F.eks. 80' },
      { name: 'overliste',   label: 'Overliste / Stempel',    type: 'text',     placeholder: 'F.eks. 30° Gooseneck 10mm' },
      { name: 'underliste',  label: 'Underliste / Matrix',    type: 'text',     placeholder: 'F.eks. V8 (åbning 8mm)' },
      { name: 'tilbagestop', label: 'Tilbagestopper X1 / X2', type: 'text',     placeholder: 'F.eks. X1=45.0, X2=45.0' },
      { name: 'bojesekvens', label: 'Bøjesekvens',            type: 'textarea', placeholder: 'Trin 1: Bøj 90° ved mål 50mm\nTrin 2: Vend emne\nTrin 3: Bøj 90° ved mål 30mm' },
    ]
  },

  'CNC Drejebænk': {
    icon: '⚙️',
    color: '#1a5276',
    fields: [
      { name: 'g54',           label: 'G54 Nulpunkt (Z-offset)',    type: 'text',     placeholder: 'Z-offset fra spindel' },
      { name: 'chuck',         label: 'Spænding / Chuck',           type: 'text',     placeholder: 'F.eks. 3-bakke ø160mm' },
      { name: 'udstiklaengde', label: 'Udstikkende længde (mm)',    type: 'number',   placeholder: 'F.eks. 55' },
      { name: 'rpm',           label: 'Omdrejninger (RPM)',         type: 'text',     placeholder: 'F.eks. Grov: 800 / Fin: 1500' },
      { name: 'fremfoering',   label: 'Fremføring (mm/omdr.)',      type: 'text',     placeholder: 'F.eks. Grov: 0.3 / Fin: 0.1' },
      { name: 'skaeredybde',   label: 'Skæredybde (mm)',            type: 'text',     placeholder: 'F.eks. Grov: 2.0 / Fin: 0.3' },
      { name: 'vaerktoejsliste', label: 'Værktøjsliste',            type: 'textarea', placeholder: 'T01 - PCLNR Grovdrejer\nT02 - PCLNR Findrejer\nT03 - Indstikker 3mm\nT04 - Gevindskærer M16' },
    ]
  },

  'CNC Fræser': {
    icon: '🏭',
    color: '#1e8449',
    fields: [
      { name: 'g54',           label: 'G54',                   type: 'text',     placeholder: 'X=0 Y=0 Z=0' },
      { name: 'g55',           label: 'G55',                   type: 'text',     placeholder: 'Ikke i brug' },
      { name: 'g56',           label: 'G56',                   type: 'text',     placeholder: 'Ikke i brug' },
      { name: 'g57',           label: 'G57',                   type: 'text',     placeholder: 'Ikke i brug' },
      { name: 'fastspending',  label: 'Fastspænding / Fixture', type: 'text',     placeholder: 'F.eks. Skruestik 125mm, bakke mod. venstre' },
      { name: 'vaerktoejsliste', label: 'Værktøjsliste',       type: 'textarea', placeholder: 'T01 - ø10 Pindfræser 4-skæret\nT02 - ø6 Pindfræser\nT03 - ø8.5 Bor\nT04 - Gevindskærer M10\nT05 - Planfræser ø63' },
    ]
  },
};

export const machineTypeNames = Object.keys(machineTemplates);
