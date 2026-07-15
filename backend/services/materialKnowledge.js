/**
 * Professional Material Knowledge Base for AI Textile Waste Intelligence Platform
 * Contains detailed material profiles for the 10 core textile categories required in Milestone 2:
 * Cotton, Polyester, Wool, Silk, Linen, Denim, Nylon, Rayon, Acrylic, Mixed Fabrics.
 */

const materialProfiles = {
  Cotton: {
    name: "Cotton",
    category: "Natural Cellulosic Fiber",
    description:
      "High-purity natural cellulosic fiber derived from the cotton plant. Highly breathable, absorbent, and biodegradable. In textile waste streams, pure cotton batches offer premier chemical and mechanical recycling yields.",
    recyclingReadiness: "High",
    recommendedPathway:
      "Mechanical shredding into reclaimed yarn (shoddy) or chemical dissolution into pure cellulose for lyocell/viscose regeneration.",
    environmentalImpact:
      "Biodegradable at end-of-life. Conventional virgin cultivation requires intensive water and pesticide input, making high-yield recycling critical for water footprint reduction.",
    handlingGuidelines:
      "Ensure moisture content is below 8% to prevent mildew during storage. Separate non-cellulosic trims, zippers, and heavy dye coatings prior to mechanical processing.",
    averageDensity: "1.54 g/cm³",
    typicalGrade: "Grade A - Clean Post-Consumer / Post-Industrial Cellulosic",
  },
  Polyester: {
    name: "Polyester",
    category: "Synthetic Thermoplastic Fiber (PET)",
    description:
      "Polyethylene terephthalate (PET) synthetic fiber known for exceptional durability, wrinkle resistance, and tensile strength. Widely prevalent across fast fashion and sportswear.",
    recyclingReadiness: "Very High",
    recommendedPathway:
      "Thermo-mechanical extrusion into recycled polyester chips/pellets (rPET) or advanced chemical depolymerization into virgin-grade PTA and MEG monomers.",
    environmentalImpact:
      "Non-biodegradable and petrochemical-based. Sheds microplastics during washing. Closed-loop recycling reduces energy consumption by up to 60% compared to virgin PET production.",
    handlingGuidelines:
      "Sort strictly by color and elastane (spandex) content. Elastane over 3% can clog mechanical extrusion filters and requires pre-chemical separation.",
    averageDensity: "1.38 g/cm³",
    typicalGrade: "Grade A+ - Thermoplastic Recyclable Feedstock",
  },
  Wool: {
    name: "Wool",
    category: "Natural Protein Fiber",
    description:
      "Natural keratin-based protein fiber sheared from sheep and other fleece animals. Naturally flame-retardant, elastic, and high-value in circular luxury fashion markets.",
    recyclingReadiness: "High",
    recommendedPathway:
      "Precision mechanical carding and spinning into closed-loop recycled wool yarn (carded wool recovery) or upcycling into premium acoustic and thermal insulation batting.",
    environmentalImpact:
      "100% natural, renewable, and biodegradable. Virgin wool has significant methane and land-use carbon impacts, giving recycled wool an exceptionally positive carbon offset.",
    handlingGuidelines:
      "Sort gently by staple length and micron fineness. Avoid aggressive laundering with alkaline agents to protect the delicate keratin fiber structure.",
    averageDensity: "1.31 g/cm³",
    typicalGrade: "Grade A - Premium Protein Reclamation",
  },
  Silk: {
    name: "Silk",
    category: "Natural Protein Fiber (Sericin/Fibroin)",
    description:
      "Luxurious natural continuous filament fiber extruded by silkworms. Possesses exceptional tensile strength, natural luster, and biocompatibility.",
    recyclingReadiness: "Moderate to High",
    recommendedPathway:
      "Mechanical garnetting into spun silk yarn, or extraction of pure fibroin protein for biomedical applications, green chemistry, and luxury bio-composite materials.",
    environmentalImpact:
      "Biodegradable and eco-friendly at disposal, but virgin sericulture involves energy-intensive heating and processing.",
    handlingGuidelines:
      "Store in cool, dry conditions shielded from direct ultraviolet (UV) exposure which accelerates protein degradation. Isolate pure silk from heavily weighted or metallic-dyed silks.",
    averageDensity: "1.25 g/cm³",
    typicalGrade: "Grade B+ - Specialty Protein Recovery",
  },
  Linen: {
    name: "Linen",
    category: "Natural Bast Fiber (Flax)",
    description:
      "Cellulosic bast fiber extracted from the stem of the flax plant. Renowned for structural strength, natural antibacterial properties, and rapid moisture wicking.",
    recyclingReadiness: "High",
    recommendedPathway:
      "Mechanical shredding for coarse spun yarns, high-grade specialty paper manufacturing, or natural fiber reinforced bio-composites for automotive and structural panels.",
    environmentalImpact:
      "Extremely low ecological footprint; flax cultivation requires zero artificial irrigation or synthetic pesticides and naturally sequesters carbon.",
    handlingGuidelines:
      "Inspect for oil or chemical contamination. Bast fibers retain high tensile rigidity and should be processed using specialized heavy-duty tearing cylinders.",
    averageDensity: "1.50 g/cm³",
    typicalGrade: "Grade A - Eco-Bast Cellulosic Feedstock",
  },
  Denim: {
    name: "Denim",
    category: "Structured Heavy Cellulosic (Cotton Twill)",
    description:
      "Heavyweight durable warp-faced cotton twill fabric, traditionally dyed with indigo. Commonly blended with 1-3% elastane for stretchability.",
    recyclingReadiness: "High",
    recommendedPathway:
      "Automated trimming of rivets/buttons followed by mechanical tearing into recycled denim fiber (carded cotton), industrial insulation, or chemical recycling.",
    environmentalImpact:
      "High virgin footprint due to heavy indigo dyeing, washing, and water usage. Reclaiming denim significantly reduces landfill burden and toxic effluent output.",
    handlingGuidelines:
      "Must undergo metal detection and automatic de-riveting before entering industrial tearing machinery. Segment rigid 100% cotton denim from stretch denim blends.",
    averageDensity: "1.52 g/cm³",
    typicalGrade: "Grade A - Heavy Twill Reclamation",
  },
  Nylon: {
    name: "Nylon",
    category: "Synthetic Thermoplastic Polyamide (PA6 / PA66)",
    description:
      "High-performance synthetic polyamide fiber exhibiting supreme abrasion resistance, elasticity, and chemical resilience. Widely used in activewear, hosiery, and industrial netting.",
    recyclingReadiness: "Very High (Especially PA6)",
    recommendedPathway:
      "Advanced chemical depolymerization (Econyl closed-loop process) back into caprolactam monomer without loss of virgin-grade performance, or thermal extrusion.",
    environmentalImpact:
      "Petrochemical origin with high energy intensity. Chemical regeneration of Nylon 6 cuts greenhouse gas emissions by up to 90% compared to petroleum manufacturing.",
    handlingGuidelines:
      "Identify Polyamide 6 vs Polyamide 66 using infrared spectroscopy if possible. Keep free of PVC trims or polyurethane waterproof coatings.",
    averageDensity: "1.14 g/cm³",
    typicalGrade: "Grade A+ - Polyamide Regeneration Feedstock",
  },
  Rayon: {
    name: "Rayon",
    category: "Semi-Synthetic Regenerated Cellulose",
    description:
      "Manufactured regenerated cellulosic fiber produced from dissolved wood pulp (viscose/modal/lyocell). Combines natural drape with synthetic uniformity.",
    recyclingReadiness: "Moderate to High",
    recommendedPathway:
      "Chemical dissolution via NMMO closed-loop solvents to produce recycled lyocell, or enzyme-assisted mechanical reclamation.",
    environmentalImpact:
      "Biodegradable, but traditional viscose processing utilizes carbon disulfide and heavy chemical baths. Modern circular recycling neutralizes toxic chemical release.",
    handlingGuidelines:
      "Wet strength is substantially lower than dry strength; avoid wet baling or storage in humid warehouses to prevent structural fiber collapse.",
    averageDensity: "1.52 g/cm³",
    typicalGrade: "Grade B - Regenerated Cellulosic Feedstock",
  },
  Acrylic: {
    name: "Acrylic",
    category: "Synthetic Polyacrylonitrile Fiber",
    description:
      "Synthetic polymer fiber composed of acrylonitrile units, engineered to mimic the warmth, softness, and loft of natural wool at lightweight densities.",
    recyclingReadiness: "Moderate",
    recommendedPathway:
      "Mechanical garnetting and blending with virgin/recycled fibers for knitwear and blankets, or chemical solvent recycling into industrial carbon fiber precursor.",
    environmentalImpact:
      "Derived from fossil fuels; prone to shedding synthetic microfibers. Difficult to biodegrade, making diversion from incineration or landfill essential.",
    handlingGuidelines:
      "Heat sensitive above 130°C. Do not expose to high-temperature friction tearing without adequate cooling airflow during mechanical opening.",
    averageDensity: "1.17 g/cm³",
    typicalGrade: "Grade B - Synthetic Wool-Alternative Feedstock",
  },
  "Mixed Fabrics": {
    name: "Mixed Fabrics",
    category: "Multi-Fiber / Poly-Cotton Blend",
    description:
      "Complex multi-component textile blends (e.g., 60% Cotton / 40% Polyester or tri-blends). Represents the largest and most challenging volume in global post-consumer textile waste.",
    recyclingReadiness: "Developing / Specialized",
    recommendedPathway:
      "Hydrothermal separation or enzymatic selective hydrolysis (dissolving cotton into glucose/cellulose while recovering intact polyester fiber), or downcycling into acoustic felt.",
    environmentalImpact:
      "Landfill-heavy if unsorted. Advanced biochemical separation unlocks dual circular value streams by salvaging both synthetic and natural polymers simultaneously.",
    handlingGuidelines:
      "Require automated NIR (Near-Infrared) sorting to quantify blend ratios. Route poly-rich blends to thermal recovery and cellulosic-rich blends to bio-chemical separation.",
    averageDensity: "1.45 g/cm³",
    typicalGrade: "Grade C - Complex Multi-Component Sorting Batch",
  },
};

/**
 * Get profile data for a classified material name
 * Falls back to "Mixed Fabrics" if exact match not found
 */
const getMaterialProfile = (materialName) => {
  const normalizedKey = Object.keys(materialProfiles).find(
    (key) => key.toLowerCase() === (materialName || "").toLowerCase()
  );
  return materialProfiles[normalizedKey || "Mixed Fabrics"];
};

module.exports = {
  materialProfiles,
  getMaterialProfile,
};
