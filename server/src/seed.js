import db, { initSchema } from './db.js';
import { fileURLToPath } from 'url';
import path from 'path';

export function seedDatabase({ force = false } = {}) {
  initSchema();

  const productCount = db.prepare('SELECT COUNT(*) AS count FROM products').get().count;
  if (productCount > 0 && !force) {
    const extended = ensureApplicationCatalog();
    return {
      skipped: true,
      message: `Database already has products; ensured application routes (+${extended.added} new).`,
      counts: {
        categories: db.prepare('SELECT COUNT(*) AS c FROM categories').get().c,
        products: db.prepare('SELECT COUNT(*) AS count FROM products').get().count,
      },
    };
  }

  if (force) {
    db.exec(`
      DELETE FROM order_items;
      DELETE FROM orders;
      DELETE FROM products;
      DELETE FROM categories;
      DELETE FROM contact_messages;
    `);
  }

  const insertCategory = db.prepare(`
    INSERT INTO categories (slug, name, description)
    VALUES (@slug, @name, @description)
  `);

  const insertProduct = db.prepare(`
    INSERT INTO products (
      slug, name, category_id, short_description, description,
      purity, form, molecular_weight, sequence, cas_number,
      price_cents, vial_size, stock, is_featured, image_color, application_route
    ) VALUES (
      @slug, @name, @category_id, @short_description, @description,
      @purity, @form, @molecular_weight, @sequence, @cas_number,
      @price_cents, @vial_size, @stock, @is_featured, @image_color, @application_route
    )
  `);

  const categories = [
    {
      slug: 'growth-factors',
      name: 'Growth Factors',
      description: 'Research peptides studied for cellular growth and tissue pathways.',
    },
    {
      slug: 'metabolic',
      name: 'Metabolic Research',
      description: 'Compounds investigated in metabolic and energy-balance models.',
    },
    {
      slug: 'recovery',
      name: 'Recovery & Repair',
      description: 'Peptides used in laboratory recovery and regeneration studies.',
    },
    {
      slug: 'cognitive',
      name: 'Cognitive Research',
      description: 'Research compounds explored in neurological and cognitive models.',
    },
  ];

  const seed = db.transaction(() => {
    const categoryIds = {};
    for (const cat of categories) {
      const result = insertCategory.run(cat);
      categoryIds[cat.slug] = Number(result.lastInsertRowid);
    }

    const products = [
      {
        slug: 'bpc-157',
        name: 'BPC-157',
        category_id: categoryIds.recovery,
        short_description: 'Body protection compound used extensively in tissue research models.',
        description:
          'BPC-157 is a synthetic pentadecapeptide derived from a protective protein found in gastric juice. It is widely used in laboratory research examining soft tissue repair pathways, angiogenesis, and inflammatory response models. Supplied as a high-purity lyophilized powder for in-vitro and research use only.',
        purity: '≥99%',
        form: 'Lyophilized powder',
        molecular_weight: '1419.5 g/mol',
        sequence: 'Gly-Glu-Pro-Pro-Pro-Gly-Lys-Pro-Ala-Asp-Asp-Ala-Gly-Leu-Val',
        cas_number: '137525-51-0',
        price_cents: 4999,
        vial_size: '5mg',
        stock: 120,
        is_featured: 1,
        image_color: '#4f46e5',
        application_route: 'injectable',
      },
      {
        slug: 'tb-500',
        name: 'TB-500 (Thymosin Beta-4 Fragment)',
        category_id: categoryIds.recovery,
        short_description: 'Actin-sequestering peptide fragment for cell migration research.',
        description:
          'TB-500 is a synthetic fragment related to Thymosin Beta-4, frequently studied for roles in cell migration, wound-healing assays, and cytoskeletal organization. Ideal for researchers investigating tissue remodeling pathways under controlled laboratory conditions.',
        purity: '≥98%',
        form: 'Lyophilized powder',
        molecular_weight: '4963.4 g/mol',
        sequence: 'Ac-Ser-Asp-Lys-Pro-Asp-Met-Ala-Glu-Ile-Glu-Lys-Phe-Asp-Lys-Ser-Lys-Leu-Lys-Lys-Thr-Glu-Thr-Gln-Glu-Lys-Asn-Pro-Leu-Pro-Ser-Lys-Glu-Thr-Ile-Glu-Gln-Glu-Lys-Gln-Ala-Gly-Glu-Ser',
        cas_number: '77591-33-4',
        price_cents: 5499,
        vial_size: '5mg',
        stock: 85,
        is_featured: 1,
        image_color: '#6366f1',
        application_route: 'injectable',
      },
      {
        slug: 'cjc-1295-no-dac',
        name: 'CJC-1295 (No DAC)',
        category_id: categoryIds['growth-factors'],
        short_description: 'Modified GHRH analog for growth hormone release research.',
        description:
          'CJC-1295 without DAC is a tetrasubstituted GHRH analog designed for research into growth hormone pulse dynamics. It is commonly paired with other secretagogues in controlled endocrine pathway studies. For laboratory research use only.',
        purity: '≥98%',
        form: 'Lyophilized powder',
        molecular_weight: '3367.9 g/mol',
        sequence: 'Tyr-D-Ala-Asp-Ala-Ile-Phe-Thr-Gln-Ser-Tyr-Arg-Lys-Val-Leu-Ala-Gln-Leu-Ser-Ala-Arg-Lys-Leu-Leu-Gln-Asp-Ile-Leu-Ser-Arg',
        cas_number: '863288-34-0',
        price_cents: 4299,
        vial_size: '2mg',
        stock: 95,
        is_featured: 1,
        image_color: '#7c3aed',
        application_route: 'injectable',
      },
      {
        slug: 'ipamorelin',
        name: 'Ipamorelin',
        category_id: categoryIds['growth-factors'],
        short_description: 'Selective ghrelin receptor agonist for GH-axis studies.',
        description:
          'Ipamorelin is a pentapeptide ghrelin mimetic studied for highly selective growth hormone secretagogue receptor activity with minimal off-target effects in research models. Frequently used in comparative GH-axis and receptor-binding assays.',
        purity: '≥99%',
        form: 'Lyophilized powder',
        molecular_weight: '711.9 g/mol',
        sequence: 'Aib-His-D-2-Nal-D-Phe-Lys-NH2',
        cas_number: '170851-70-4',
        price_cents: 3999,
        vial_size: '5mg',
        stock: 140,
        is_featured: 0,
        image_color: '#4f46e5',
        application_route: 'injectable',
      },
      {
        slug: 'semaglutide',
        name: 'Semaglutide',
        category_id: categoryIds.metabolic,
        short_description: 'GLP-1 receptor agonist analog for metabolic pathway research.',
        description:
          'Semaglutide is a long-acting GLP-1 receptor agonist analog used in laboratory research on glucose homeostasis, appetite signaling, and metabolic regulation. High-purity material for in-vitro and preclinical research protocols only.',
        purity: '≥98%',
        form: 'Lyophilized powder',
        molecular_weight: '4113.6 g/mol',
        sequence: 'H-His-Aib-Glu-Gly-Thr-Phe-Thr-Ser-Asp-Val-Ser-Ser-Tyr-Leu-Glu-Gly-Gln-Ala-Ala-Lys(AEEA-AEEA-γ-Glu-C18 diacid)-Glu-Phe-Ile-Ala-Trp-Leu-Val-Arg-Gly-Arg-Gly-OH',
        cas_number: '910463-68-2',
        price_cents: 12999,
        vial_size: '5mg',
        stock: 60,
        is_featured: 1,
        image_color: '#db2777',
        application_route: 'injectable',
      },
      {
        slug: 'tirzepatide',
        name: 'Tirzepatide',
        category_id: categoryIds.metabolic,
        short_description: 'Dual GIP/GLP-1 receptor agonist for dual-incretin research.',
        description:
          'Tirzepatide is a dual glucose-dependent insulinotropic polypeptide (GIP) and glucagon-like peptide-1 (GLP-1) receptor agonist analog. Used in advanced metabolic research exploring dual-incretin signaling pathways under controlled conditions.',
        purity: '≥98%',
        form: 'Lyophilized powder',
        molecular_weight: '4813.5 g/mol',
        sequence: 'Dual GIP/GLP-1 RA analog',
        cas_number: '2023788-19-2',
        price_cents: 14999,
        vial_size: '5mg',
        stock: 45,
        is_featured: 1,
        image_color: '#e11d48',
        application_route: 'injectable',
      },
      {
        slug: 'mots-c',
        name: 'MOTS-c',
        category_id: categoryIds.metabolic,
        short_description: 'Mitochondrial-derived peptide for metabolic stress research.',
        description:
          'MOTS-c is a 16-amino-acid mitochondrial open reading frame peptide studied for roles in metabolic homeostasis, insulin sensitivity models, and cellular stress responses. Supplied for research applications only.',
        purity: '≥98%',
        form: 'Lyophilized powder',
        molecular_weight: '2174.6 g/mol',
        sequence: 'Met-Arg-Trp-Gln-Glu-Met-Gly-Tyr-Ile-Phe-Tyr-Pro-Arg-Lys-Leu-Arg',
        cas_number: '1627580-64-6',
        price_cents: 5999,
        vial_size: '10mg',
        stock: 70,
        is_featured: 0,
        image_color: '#ea580c',
        application_route: 'injectable',
      },
      {
        slug: 'ghk-cu',
        name: 'GHK-Cu',
        category_id: categoryIds.recovery,
        short_description: 'Copper-binding tripeptide for topical skin and tissue research.',
        description:
          'GHK-Cu is a naturally occurring copper complex of the tripeptide glycyl-L-histidyl-L-lysine. Widely researched for extracellular matrix remodeling, antioxidant response, and gene-expression studies related to tissue maintenance. Supplied for topical research formulations.',
        purity: '≥99%',
        form: 'Topical research solution',
        molecular_weight: '403.9 g/mol',
        sequence: 'Gly-His-Lys · Cu',
        cas_number: '89030-95-5',
        price_cents: 3499,
        vial_size: '50mg',
        stock: 200,
        is_featured: 1,
        image_color: '#8b5cf6',
        application_route: 'topical',
      },
      {
        slug: 'selank',
        name: 'Selank (Nasal)',
        category_id: categoryIds.cognitive,
        short_description: 'Tuftsin analog supplied for nasal research delivery models.',
        description:
          'Selank is a synthetic heptapeptide analog of tuftsin studied in models of anxiety regulation, cognitive performance, and immunomodulation. This listing is prepared for nasal research application pathways under controlled laboratory protocols.',
        purity: '≥98%',
        form: 'Nasal research spray base',
        molecular_weight: '751.9 g/mol',
        sequence: 'Thr-Lys-Pro-Arg-Pro-Gly-Pro',
        cas_number: '129954-34-3',
        price_cents: 4499,
        vial_size: '5mg',
        stock: 90,
        is_featured: 1,
        image_color: '#2563eb',
        application_route: 'nasal',
      },
      {
        slug: 'semax',
        name: 'Semax (Nasal)',
        category_id: categoryIds.cognitive,
        short_description: 'ACTH(4-10) analog for nasal neuroprotective research models.',
        description:
          'Semax is a synthetic heptapeptide derived from the ACTH(4–10) fragment. Research applications include studies of neurotrophic factor expression and cognitive performance assays. Supplied for nasal research delivery models only.',
        purity: '≥98%',
        form: 'Nasal research spray base',
        molecular_weight: '813.9 g/mol',
        sequence: 'Met-Glu-His-Phe-Pro-Gly-Pro',
        cas_number: '80714-61-0',
        price_cents: 4299,
        vial_size: '5mg',
        stock: 88,
        is_featured: 1,
        image_color: '#1d4ed8',
        application_route: 'nasal',
      },
      {
        slug: 'epithalon',
        name: 'Epithalon',
        category_id: categoryIds.cognitive,
        short_description: 'Tetrapeptide studied in telomerase and aging research.',
        description:
          'Epithalon (Epitalon) is a synthetic tetrapeptide corresponding to the active component of epithalamin. It is used in research exploring telomerase activity, circadian regulation, and cellular aging pathways.',
        purity: '≥99%',
        form: 'Lyophilized powder',
        molecular_weight: '390.3 g/mol',
        sequence: 'Ala-Glu-Asp-Gly',
        cas_number: '307297-39-8',
        price_cents: 3799,
        vial_size: '10mg',
        stock: 110,
        is_featured: 0,
        image_color: '#6366f1',
        application_route: 'injectable',
      },
      {
        slug: 'melanotan-ii',
        name: 'Melanotan II',
        category_id: categoryIds['growth-factors'],
        short_description: 'Cyclic alpha-MSH analog for melanocortin receptor research.',
        description:
          'Melanotan II is a synthetic cyclic heptapeptide analog of α-melanocyte-stimulating hormone. Used in laboratory research of melanocortin receptor subtypes and related physiological pathways. Research use only.',
        purity: '≥98%',
        form: 'Lyophilized powder',
        molecular_weight: '1024.2 g/mol',
        sequence: 'Ac-Nle-cyclo[Asp-His-D-Phe-Arg-Trp-Lys]-NH2',
        cas_number: '121062-08-6',
        price_cents: 3299,
        vial_size: '10mg',
        stock: 75,
        is_featured: 0,
        image_color: '#9333ea',
        application_route: 'injectable',
      },
      // --- Topical research compounds (apply; not injectable) ---
      {
        slug: 'ghk-cu-serum',
        name: 'GHK-Cu Topical Serum',
        category_id: categoryIds.recovery,
        short_description: 'Ready-to-formulate copper peptide for topical dermal research.',
        description:
          'Research-grade GHK-Cu prepared for topical serum and cream matrix studies examining collagen pathways, skin barrier models, and local tissue response assays. Not for injection. Laboratory research use only.',
        purity: '≥99%',
        form: 'Topical serum concentrate',
        molecular_weight: '403.9 g/mol',
        sequence: 'Gly-His-Lys · Cu',
        cas_number: '89030-95-5',
        price_cents: 4299,
        vial_size: '30ml',
        stock: 150,
        is_featured: 1,
        image_color: '#7c3aed',
        application_route: 'topical',
      },
      {
        slug: 'argireline',
        name: 'Argireline (Acetyl Hexapeptide-8)',
        category_id: categoryIds.recovery,
        short_description: 'Hexapeptide for topical expression-line research models.',
        description:
          'Acetyl Hexapeptide-8 (Argireline) is studied in topical formulations for SNARE-complex related pathways and dermal appearance models. Supplied for non-injectable topical research only.',
        purity: '≥98%',
        form: 'Topical research solution',
        molecular_weight: '889.0 g/mol',
        sequence: 'Ac-Glu-Glu-Met-Gln-Arg-Arg-NH2',
        cas_number: '616204-22-9',
        price_cents: 3999,
        vial_size: '10mg',
        stock: 130,
        is_featured: 1,
        image_color: '#a855f7',
        application_route: 'topical',
      },
      {
        slug: 'matrixyl-3000',
        name: 'Matrixyl 3000 (Palmitoyl peptides)',
        category_id: categoryIds.recovery,
        short_description: 'Palmitoyl peptide complex for topical matrix research.',
        description:
          'A palmitoyl peptide complex researched in topical matrices for extracellular matrix signaling and dermal structure models. Apply-only research material — not for injection.',
        purity: '≥98%',
        form: 'Topical peptide complex',
        molecular_weight: '—',
        sequence: 'Palmitoyl tri/tetra-peptide complex',
        cas_number: '—',
        price_cents: 4599,
        vial_size: '10mg',
        stock: 100,
        is_featured: 0,
        image_color: '#f43f5e',
        application_route: 'topical',
      },
      {
        slug: 'snap-8',
        name: 'SNAP-8 (Acetyl Octapeptide-3)',
        category_id: categoryIds.recovery,
        short_description: 'Octapeptide for topical neuropeptide pathway research.',
        description:
          'Acetyl Octapeptide-3 (SNAP-8) is used in topical research exploring neuropeptide signaling and dermal surface models. Supplied strictly for non-injectable laboratory research.',
        purity: '≥98%',
        form: 'Topical research powder',
        molecular_weight: '1075.2 g/mol',
        sequence: 'Ac-Glu-Glu-Met-Gln-Arg-Arg-Ala-Asp-NH2',
        cas_number: '868844-74-0',
        price_cents: 4199,
        vial_size: '10mg',
        stock: 95,
        is_featured: 0,
        image_color: '#e11d48',
        application_route: 'topical',
      },
      // --- Nasal research compounds ---
      {
        slug: 'semax-nasal-kit',
        name: 'Semax Nasal Research Kit',
        category_id: categoryIds.cognitive,
        short_description: 'Semax with nasal delivery vehicle for research protocols.',
        description:
          'Semax research kit including peptide and nasal research vehicle components for controlled laboratory nasal delivery studies. Not for human consumption. Research use only.',
        purity: '≥98%',
        form: 'Nasal research kit',
        molecular_weight: '813.9 g/mol',
        sequence: 'Met-Glu-His-Phe-Pro-Gly-Pro',
        cas_number: '80714-61-0',
        price_cents: 5499,
        vial_size: '10mg',
        stock: 70,
        is_featured: 1,
        image_color: '#3b82f6',
        application_route: 'nasal',
      },
      {
        slug: 'selank-nasal-kit',
        name: 'Selank Nasal Research Kit',
        category_id: categoryIds.cognitive,
        short_description: 'Selank nasal research preparation for laboratory models.',
        description:
          'Selank kit configured for nasal research delivery models under controlled laboratory conditions. For in vitro / laboratory research only — not for injection or human use.',
        purity: '≥98%',
        form: 'Nasal research kit',
        molecular_weight: '751.9 g/mol',
        sequence: 'Thr-Lys-Pro-Arg-Pro-Gly-Pro',
        cas_number: '129954-34-3',
        price_cents: 5299,
        vial_size: '10mg',
        stock: 65,
        is_featured: 0,
        image_color: '#6366f1',
        application_route: 'nasal',
      },
      {
        slug: 'oxytocin-nasal',
        name: 'Oxytocin (Nasal Research)',
        category_id: categoryIds.cognitive,
        short_description: 'Oxytocin peptide for nasal research delivery studies.',
        description:
          'Synthetic oxytocin for laboratory research into neuropeptide pathways using nasal delivery models. Research compounds only — not for human or veterinary use.',
        purity: '≥98%',
        form: 'Nasal research powder',
        molecular_weight: '1007.2 g/mol',
        sequence: 'Cys-Tyr-Ile-Gln-Asn-Cys-Pro-Leu-Gly-NH2 (disulfide)',
        cas_number: '50-56-6',
        price_cents: 4799,
        vial_size: '5mg',
        stock: 80,
        is_featured: 1,
        image_color: '#8b5cf6',
        application_route: 'nasal',
      },
      {
        slug: 'dihexa-nasal',
        name: 'Dihexa (Nasal Research)',
        category_id: categoryIds.cognitive,
        short_description: 'Ang IV analog studied in nasal cognitive research models.',
        description:
          'Dihexa is an angiotensin IV analog researched in cognitive and neurotrophic laboratory models. This listing supports nasal research delivery protocols only.',
        purity: '≥98%',
        form: 'Nasal research powder',
        molecular_weight: '504.7 g/mol',
        sequence: 'N-hexanoic-Tyr-Ile-(6) aminohexanoic amide',
        cas_number: '1401708-83-5',
        price_cents: 6999,
        vial_size: '5mg',
        stock: 55,
        is_featured: 0,
        image_color: '#a855f7',
        application_route: 'nasal',
      },
    ];

    for (const product of products) {
      insertProduct.run(product);
    }
  });

  seed();

  // Upgrade existing DBs with routes + any missing catalog items
  ensureApplicationCatalog();

  const counts = {
    categories: db.prepare('SELECT COUNT(*) AS c FROM categories').get().c,
    products: db.prepare('SELECT COUNT(*) AS c FROM products').get().c,
  };

  return { skipped: false, message: 'Seed complete', counts };
}

/**
 * For already-seeded databases: set application routes and insert new topical/nasal items.
 */
export function ensureApplicationCatalog() {
  initSchema();

  // Refresh vial accent colors to indigo/coral palette (existing DBs)
  const colorUpdates = [
    ['bpc-157', '#4f46e5'],
    ['tb-500', '#6366f1'],
    ['ghk-cu', '#8b5cf6'],
    ['ghk-cu-serum', '#7c3aed'],
    ['argireline', '#a855f7'],
    ['matrixyl-3000', '#f43f5e'],
    ['snap-8', '#e11d48'],
  ];
  const colorStmt = db.prepare(
    `UPDATE products SET image_color = ?, updated_at = datetime('now') WHERE slug = ?`
  );
  for (const [slug, color] of colorUpdates) {
    colorStmt.run(color, slug);
  }

  // Map known injectables / reclassifications
  const routeUpdates = [
    { slug: 'ghk-cu', route: 'topical', form: 'Topical research solution' },
    { slug: 'selank', route: 'nasal', form: 'Nasal research spray base', name: 'Selank (Nasal)' },
    { slug: 'semax', route: 'nasal', form: 'Nasal research spray base', name: 'Semax (Nasal)' },
  ];
  for (const u of routeUpdates) {
    if (u.name) {
      db.prepare(
        `UPDATE products SET application_route = ?, form = ?, name = ?, updated_at = datetime('now') WHERE slug = ?`
      ).run(u.route, u.form, u.name, u.slug);
    } else {
      db.prepare(
        `UPDATE products SET application_route = ?, form = ?, updated_at = datetime('now') WHERE slug = ?`
      ).run(u.route, u.form, u.slug);
    }
  }
  db.prepare(
    `UPDATE products SET application_route = 'injectable' WHERE application_route IS NULL OR application_route = ''`
  ).run();

  // Ensure recovery + cognitive categories exist for inserts
  let recoveryId = db.prepare(`SELECT id FROM categories WHERE slug = 'recovery'`).get()?.id;
  let cognitiveId = db.prepare(`SELECT id FROM categories WHERE slug = 'cognitive'`).get()?.id;
  if (!recoveryId) {
    recoveryId = Number(
      db
        .prepare(
          `INSERT INTO categories (slug, name, description) VALUES ('recovery', 'Recovery & Repair', 'Tissue and recovery research compounds.')`
        )
        .run().lastInsertRowid
    );
  }
  if (!cognitiveId) {
    cognitiveId = Number(
      db
        .prepare(
          `INSERT INTO categories (slug, name, description) VALUES ('cognitive', 'Cognitive Research', 'Neurological research compounds.')`
        )
        .run().lastInsertRowid
    );
  }

  const extras = [
    {
      slug: 'ghk-cu-serum',
      name: 'GHK-Cu Topical Serum',
      category_id: recoveryId,
      short_description: 'Ready-to-formulate copper peptide for topical dermal research.',
      description:
        'Research-grade GHK-Cu prepared for topical serum and cream matrix studies. Not for injection. Laboratory research use only.',
      purity: '≥99%',
      form: 'Topical serum concentrate',
      molecular_weight: '403.9 g/mol',
      sequence: 'Gly-His-Lys · Cu',
      cas_number: '89030-95-5',
      price_cents: 4299,
      vial_size: '30ml',
      stock: 150,
      is_featured: 1,
      image_color: '#7c3aed',
      application_route: 'topical',
    },
    {
      slug: 'argireline',
      name: 'Argireline (Acetyl Hexapeptide-8)',
      category_id: recoveryId,
      short_description: 'Hexapeptide for topical expression-line research models.',
      description:
        'Acetyl Hexapeptide-8 researched in topical formulations. Non-injectable topical research only.',
      purity: '≥98%',
      form: 'Topical research solution',
      molecular_weight: '889.0 g/mol',
      sequence: 'Ac-Glu-Glu-Met-Gln-Arg-Arg-NH2',
      cas_number: '616204-22-9',
      price_cents: 3999,
      vial_size: '10mg',
      stock: 130,
      is_featured: 1,
      image_color: '#a855f7',
      application_route: 'topical',
    },
    {
      slug: 'matrixyl-3000',
      name: 'Matrixyl 3000 (Palmitoyl peptides)',
      category_id: recoveryId,
      short_description: 'Palmitoyl peptide complex for topical matrix research.',
      description:
        'Palmitoyl peptide complex for topical dermal matrix research. Apply-only — not for injection.',
      purity: '≥98%',
      form: 'Topical peptide complex',
      molecular_weight: '—',
      sequence: 'Palmitoyl tri/tetra-peptide complex',
      cas_number: '—',
      price_cents: 4599,
      vial_size: '10mg',
      stock: 100,
      is_featured: 0,
      image_color: '#f43f5e',
      application_route: 'topical',
    },
    {
      slug: 'snap-8',
      name: 'SNAP-8 (Acetyl Octapeptide-3)',
      category_id: recoveryId,
      short_description: 'Octapeptide for topical neuropeptide pathway research.',
      description:
        'Acetyl Octapeptide-3 for topical laboratory research. Not for injection.',
      purity: '≥98%',
      form: 'Topical research powder',
      molecular_weight: '1075.2 g/mol',
      sequence: 'Ac-Glu-Glu-Met-Gln-Arg-Arg-Ala-Asp-NH2',
      cas_number: '868844-74-0',
      price_cents: 4199,
      vial_size: '10mg',
      stock: 95,
      is_featured: 0,
      image_color: '#e11d48',
      application_route: 'topical',
    },
    {
      slug: 'semax-nasal-kit',
      name: 'Semax Nasal Research Kit',
      category_id: cognitiveId,
      short_description: 'Semax with nasal delivery vehicle for research protocols.',
      description:
        'Semax research kit for controlled laboratory nasal delivery studies. Research use only.',
      purity: '≥98%',
      form: 'Nasal research kit',
      molecular_weight: '813.9 g/mol',
      sequence: 'Met-Glu-His-Phe-Pro-Gly-Pro',
      cas_number: '80714-61-0',
      price_cents: 5499,
      vial_size: '10mg',
      stock: 70,
      is_featured: 1,
      image_color: '#3b82f6',
      application_route: 'nasal',
    },
    {
      slug: 'selank-nasal-kit',
      name: 'Selank Nasal Research Kit',
      category_id: cognitiveId,
      short_description: 'Selank nasal research preparation for laboratory models.',
      description:
        'Selank kit for nasal research delivery models. Not for injection or human use.',
      purity: '≥98%',
      form: 'Nasal research kit',
      molecular_weight: '751.9 g/mol',
      sequence: 'Thr-Lys-Pro-Arg-Pro-Gly-Pro',
      cas_number: '129954-34-3',
      price_cents: 5299,
      vial_size: '10mg',
      stock: 65,
      is_featured: 0,
      image_color: '#6366f1',
      application_route: 'nasal',
    },
    {
      slug: 'oxytocin-nasal',
      name: 'Oxytocin (Nasal Research)',
      category_id: cognitiveId,
      short_description: 'Oxytocin peptide for nasal research delivery studies.',
      description:
        'Synthetic oxytocin for nasal delivery laboratory research. Not for human or veterinary use.',
      purity: '≥98%',
      form: 'Nasal research powder',
      molecular_weight: '1007.2 g/mol',
      sequence: 'Cys-Tyr-Ile-Gln-Asn-Cys-Pro-Leu-Gly-NH2 (disulfide)',
      cas_number: '50-56-6',
      price_cents: 4799,
      vial_size: '5mg',
      stock: 80,
      is_featured: 1,
      image_color: '#8b5cf6',
      application_route: 'nasal',
    },
    {
      slug: 'dihexa-nasal',
      name: 'Dihexa (Nasal Research)',
      category_id: cognitiveId,
      short_description: 'Ang IV analog studied in nasal cognitive research models.',
      description:
        'Dihexa for nasal cognitive research protocols. Laboratory research only.',
      purity: '≥98%',
      form: 'Nasal research powder',
      molecular_weight: '504.7 g/mol',
      sequence: 'N-hexanoic-Tyr-Ile-(6) aminohexanoic amide',
      cas_number: '1401708-83-5',
      price_cents: 6999,
      vial_size: '5mg',
      stock: 55,
      is_featured: 0,
      image_color: '#a855f7',
      application_route: 'nasal',
    },
  ];

  const exists = db.prepare(`SELECT id FROM products WHERE slug = ?`);
  const insert = db.prepare(`
    INSERT INTO products (
      slug, name, category_id, short_description, description,
      purity, form, molecular_weight, sequence, cas_number,
      price_cents, vial_size, stock, is_featured, image_color, application_route
    ) VALUES (
      @slug, @name, @category_id, @short_description, @description,
      @purity, @form, @molecular_weight, @sequence, @cas_number,
      @price_cents, @vial_size, @stock, @is_featured, @image_color, @application_route
    )
  `);

  let added = 0;
  for (const p of extras) {
    if (!exists.get(p.slug)) {
      insert.run(p);
      added += 1;
    }
  }
  return { added };
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isMain) {
  const result = seedDatabase();
  console.log(result.message, result.counts || '');
  if (result.skipped) {
    console.log('Run `npm run db:reset` to wipe and reseed.');
  }
}
