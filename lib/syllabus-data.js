/**
 * Curated syllabus reference topics for Indian Education Boards (CBSE, ICSE, State Boards).
 * Note: These provide reference topic suggestions based on standard NCERT/CISCE patterns.
 * They are provided for student guidance and do not represent exclusive or unverified official exam papers.
 */

const BOARDS = [
  { id: 'CBSE', name: 'CBSE (Central Board of Secondary Education)' },
  { id: 'ICSE', name: 'ICSE / ISC (CISCE)' },
  { id: 'State Board', name: 'State Board' }
];

const STATE_BOARDS = [
  'Maharashtra State Board (MSBSHSE)',
  'Tamil Nadu State Board',
  'Karnataka State Board (KSEEB)',
  'Uttar Pradesh State Board (UPMSP)',
  'West Bengal Board (WBBSE/WBCHSE)',
  'Kerala State Board (SCERT)',
  'Andhra Pradesh State Board (BIEAP)',
  'Gujarat State Board (GSEB)',
  'Rajasthan State Board (RBSE)',
  'Madhya Pradesh Board (MPBSE)',
  'Punjab School Education Board (PSEB)',
  'Bihar School Examination Board (BSEB)',
  'Delhi Directorate of Education'
];

const CLASSES = ['6', '7', '8', '9', '10', '11', '12'];

const SYLLABUS = {
  '6': {
    subjects: [
      {
        id: 'Science',
        name: 'Science',
        chapters: [
          'Components of Food',
          'Sorting Materials into Groups',
          'Separation of Substances',
          'Getting to Know Plants',
          'Body Movements',
          'The Living Organisms — Characteristics & Habitats',
          'Motion and Measurement of Distances',
          'Light, Shadows and Reflections',
          'Electricity and Circuits',
          'Fun with Magnets'
        ]
      },
      {
        id: 'Mathematics',
        name: 'Mathematics',
        chapters: [
          'Knowing Our Numbers',
          'Whole Numbers',
          'Playing with Numbers',
          'Basic Geometrical Ideas',
          'Understanding Elementary Shapes',
          'Integers',
          'Fractions and Decimals',
          'Data Handling',
          'Mensuration',
          'Algebra',
          'Ratio and Proportion'
        ]
      },
      {
        id: 'Social Science',
        name: 'Social Science',
        chapters: [
          'What, Where, How and When? (History)',
          'From Hunting-Gathering to Growing Food',
          'In the Earliest Cities',
          'The Earth in the Solar System (Geography)',
          'Globe: Latitudes and Longitudes',
          'Motions of the Earth',
          'Understanding Diversity (Civics)',
          'Diversity and Discrimination',
          'What is Government?'
        ]
      },
      {
        id: 'English',
        name: 'English Grammar & Reading',
        chapters: [
          'Nouns and Pronouns',
          'Verbs and Tenses',
          'Adjectives and Adverbs',
          'Prepositions and Conjunctions',
          'Reading Comprehension & Vocabulary',
          'Active and Passive Voice (Basics)',
          'Direct and Indirect Speech (Basics)'
        ]
      }
    ]
  },
  '7': {
    subjects: [
      {
        id: 'Science',
        name: 'Science',
        chapters: [
          'Nutrition in Plants',
          'Nutrition in Animals',
          'Heat and Temperature',
          'Acids, Bases and Salts',
          'Physical and Chemical Changes',
          'Respiration in Organisms',
          'Transportation in Animals and Plants',
          'Reproduction in Plants',
          'Motion and Time',
          'Electric Current and Its Effects',
          'Light and Reflection',
          'Forests: Our Lifeline'
        ]
      },
      {
        id: 'Mathematics',
        name: 'Mathematics',
        chapters: [
          'Integers',
          'Fractions and Decimals',
          'Data Handling',
          'Simple Equations',
          'Lines and Angles',
          'The Triangle and Its Properties',
          'Comparing Quantities',
          'Rational Numbers',
          'Perimeter and Area',
          'Algebraic Expressions',
          'Exponents and Powers'
        ]
      },
      {
        id: 'Social Science',
        name: 'Social Science',
        chapters: [
          'Tracing Changes Through a Thousand Years',
          'New Kings and Kingdoms',
          'The Delhi Sultans & The Mughal Empire',
          'Environment and Ecosystem (Geography)',
          'Inside Our Earth',
          'Our Changing Earth',
          'Air and Water',
          'On Equality (Civics)',
          'Role of the Government in Health'
        ]
      },
      {
        id: 'English',
        name: 'English Grammar & Vocabulary',
        chapters: [
          'Subject-Verb Agreement',
          'Tenses & Modals',
          'Clauses and Conjunctions',
          'Reported Speech',
          'Idioms and Phrasal Verbs',
          'Vocabulary & Context Clues'
        ]
      }
    ]
  },
  '8': {
    subjects: [
      {
        id: 'Science',
        name: 'Science',
        chapters: [
          'Crop Production and Management',
          'Microorganisms: Friend and Foe',
          'Coal and Petroleum',
          'Combustion and Flame',
          'Conservation of Plants and Animals',
          'Reproduction in Animals',
          'Reaching the Age of Adolescence',
          'Force and Pressure',
          'Friction',
          'Sound',
          'Chemical Effects of Electric Current',
          'Some Natural Phenomena',
          'Light and Human Eye'
        ]
      },
      {
        id: 'Mathematics',
        name: 'Mathematics',
        chapters: [
          'Rational Numbers',
          'Linear Equations in One Variable',
          'Understanding Quadrilaterals',
          'Data Handling & Probability',
          'Squares and Square Roots',
          'Cubes and Cube Roots',
          'Comparing Quantities & Compound Interest',
          'Algebraic Expressions and Identities',
          'Mensuration',
          'Exponents and Powers',
          'Direct and Inverse Proportions',
          'Factorisation',
          'Introduction to Graphs'
        ]
      },
      {
        id: 'Social Science',
        name: 'Social Science',
        chapters: [
          'How, When and Where',
          'From Trade to Territory (The Company Power)',
          'When People Rebel: 1857 and After',
          'Resources (Land, Soil, Water, Natural Vegetation)',
          'Agriculture and Industries',
          'The Indian Constitution',
          'Understanding Secularism',
          'Parliament and Law Making',
          'Judiciary and Criminal Justice'
        ]
      },
      {
        id: 'English',
        name: 'English Grammar & Composition',
        chapters: [
          'Tenses, Modals and Conditionals',
          'Active and Passive Voice',
          'Direct and Indirect Speech',
          'Non-Finites (Infinitives, Gerunds, Participles)',
          'Sentence Transformation',
          'Vocabulary & Synonyms/Antonyms'
        ]
      }
    ]
  },
  '9': {
    subjects: [
      {
        id: 'Science',
        name: 'Science (Physics, Chemistry, Biology)',
        chapters: [
          'Matter in Our Surroundings',
          'Is Matter Around Us Pure?',
          'Atoms and Molecules',
          'Structure of the Atom',
          'The Fundamental Unit of Life (Cell)',
          'Tissues (Plant and Animal)',
          'Motion (Kinematics)',
          'Force and Laws of Motion',
          'Gravitation & Floatation',
          'Work, Energy and Power',
          'Sound and Wave Properties',
          'Improvement in Food Resources'
        ]
      },
      {
        id: 'Mathematics',
        name: 'Mathematics',
        chapters: [
          'Number Systems (Real Numbers)',
          'Polynomials',
          'Coordinate Geometry',
          'Linear Equations in Two Variables',
          'Introduction to Euclid’s Geometry',
          'Lines and Angles',
          'Triangles (Congruence and Inequalities)',
          'Quadrilaterals',
          'Circles',
          'Heron’s Formula',
          'Surface Areas and Volumes',
          'Statistics & Probability'
        ]
      },
      {
        id: 'Social Science',
        name: 'Social Science',
        chapters: [
          'The French Revolution',
          'Socialism in Europe and the Russian Revolution',
          'Nazism and the Rise of Hitler',
          'India: Size and Location',
          'Physical Features of India',
          'Drainage (Rivers and Lakes)',
          'Climate of India',
          'What is Democracy? Why Democracy?',
          'Constitutional Design',
          'Electoral Politics',
          'Working of Institutions',
          'The Story of Village Palampur',
          'People as Resource',
          'Poverty as a Challenge'
        ]
      },
      {
        id: 'Computer Applications',
        name: 'Computer Applications / IT',
        chapters: [
          'Computer System Overview & Architecture',
          'Data Representation & Boolean Logic',
          'Word Processing & Digital Documentation',
          'Electronic Spreadsheets',
          'Digital Presentations',
          'Cyber Safety and Digital Footprint',
          'Python Basics / Block Coding Fundamentals'
        ]
      },
      {
        id: 'English Language',
        name: 'English Language & Literature',
        chapters: [
          'Tenses and Determiners',
          'Subject-Verb Concord',
          'Modals and Reported Speech',
          'Prepositions and Clauses',
          'Reading Comprehension & Critical Analysis',
          'Poetic Devices and Figures of Speech'
        ]
      }
    ]
  },
  '10': {
    subjects: [
      {
        id: 'Science',
        name: 'Science (Physics, Chemistry, Biology)',
        chapters: [
          'Chemical Reactions and Equations',
          'Acids, Bases and Salts',
          'Metals and Non-Metals',
          'Carbon and Its Compounds',
          'Life Processes (Nutrition, Respiration, Transport, Excretion)',
          'Control and Coordination',
          'How do Organisms Reproduce?',
          'Heredity and Evolution',
          'Light: Reflection and Refraction',
          'The Human Eye and the Colourful World',
          'Electricity (Ohm’s Law, Circuits, Heating Effect)',
          'Magnetic Effects of Electric Current',
          'Our Environment'
        ]
      },
      {
        id: 'Mathematics',
        name: 'Mathematics',
        chapters: [
          'Real Numbers (Euclid & Fundamental Theorem of Arithmetic)',
          'Polynomials (Zeroes and Relations)',
          'Pair of Linear Equations in Two Variables',
          'Quadratic Equations',
          'Arithmetic Progressions (AP)',
          'Triangles (Similarity, BPT, Pythagoras Theorem)',
          'Coordinate Geometry (Distance & Section Formula)',
          'Introduction to Trigonometry',
          'Some Applications of Trigonometry (Heights & Distances)',
          'Circles (Tangents and Properties)',
          'Areas Related to Circles',
          'Surface Areas and Volumes',
          'Statistics (Mean, Median, Mode)',
          'Probability'
        ]
      },
      {
        id: 'Social Science',
        name: 'Social Science',
        chapters: [
          'The Rise of Nationalism in Europe',
          'Nationalism in India',
          'The Making of a Global World',
          'The Age of Industrialisation',
          'Print Culture and the Modern World',
          'Resources and Development',
          'Forest and Wildlife Resources',
          'Water Resources',
          'Agriculture',
          'Minerals and Energy Resources',
          'Manufacturing Industries',
          'Lifelines of National Economy',
          'Power Sharing and Federalism',
          'Gender, Religion and Caste',
          'Political Parties',
          'Outcomes of Democracy',
          'Development (Economics)',
          'Sectors of the Indian Economy',
          'Money and Credit',
          'Globalisation and the Indian Economy'
        ]
      },
      {
        id: 'Information Technology',
        name: 'Information Technology (IT 402 / Computer Applications)',
        chapters: [
          'Communication Skills & Self-Management',
          'Information and Communication Technology (ICT) Skills',
          'Digital Documentation (Advanced)',
          'Electronic Spreadsheet (Advanced)',
          'Database Management System (DBMS)',
          'Web Applications and Security',
          'Java / Python Programming Basics'
        ]
      },
      {
        id: 'English',
        name: 'English Language & Literature',
        chapters: [
          'Tenses and Modals',
          'Subject-Verb Agreement',
          'Reported Speech (Commands, Requests, Statements, Questions)',
          'Determiners',
          'Reading Comprehension & Analysis',
          'Poetic Devices (Metaphor, Simile, Personification, Alliteration)'
        ]
      }
    ]
  },
  '11': {
    subjects: [
      {
        id: 'Physics',
        name: 'Physics',
        chapters: [
          'Units and Measurements',
          'Motion in a Straight Line',
          'Motion in a Plane (Vectors & Projectile)',
          'Laws of Motion (Newton’s Laws & Friction)',
          'Work, Energy and Power',
          'System of Particles and Rotational Motion',
          'Gravitation (Kepler’s Laws, Potential)',
          'Mechanical Properties of Solids',
          'Mechanical Properties of Fluids',
          'Thermal Properties of Matter',
          'Thermodynamics',
          'Kinetic Theory of Gases',
          'Oscillations (Simple Harmonic Motion)',
          'Waves'
        ]
      },
      {
        id: 'Chemistry',
        name: 'Chemistry',
        chapters: [
          'Some Basic Concepts of Chemistry (Mole Concept)',
          'Structure of Atom (Quantum Numbers, Orbitals)',
          'Classification of Elements and Periodicity in Properties',
          'Chemical Bonding and Molecular Structure (VSEPR, Hybridisation)',
          'Thermodynamics (Enthalpy, Entropy, Gibbs Energy)',
          'Equilibrium (Chemical and Ionic)',
          'Redox Reactions',
          'Organic Chemistry: Some Basic Principles and Techniques',
          'Hydrocarbons (Alkanes, Alkenes, Alkynes, Aromatic)'
        ]
      },
      {
        id: 'Mathematics',
        name: 'Mathematics',
        chapters: [
          'Sets and Relations',
          'Functions',
          'Trigonometric Functions',
          'Complex Numbers and Quadratic Equations',
          'Linear Inequalities',
          'Permutations and Combinations',
          'Binomial Theorem',
          'Sequences and Series (AP & GP)',
          'Straight Lines',
          'Conic Sections (Circles, Parabola, Ellipse, Hyperbola)',
          'Introduction to Three Dimensional Geometry',
          'Limits and Derivatives',
          'Statistics and Probability'
        ]
      },
      {
        id: 'Biology',
        name: 'Biology',
        chapters: [
          'The Living World',
          'Biological Classification',
          'Plant Kingdom',
          'Animal Kingdom',
          'Morphology of Flowering Plants',
          'Anatomy of Flowering Plants',
          'Structural Organisation in Animals',
          'Cell: The Unit of Life',
          'Biomolecules',
          'Cell Cycle and Cell Division',
          'Photosynthesis in Higher Plants',
          'Respiration in Plants',
          'Plant Growth and Development',
          'Breathing and Exchange of Gases',
          'Body Fluids and Circulation',
          'Excretory Products and their Elimination',
          'Locomotion and Movement',
          'Neural Control and Coordination',
          'Chemical Coordination and Integration'
        ]
      },
      {
        id: 'Computer Science',
        name: 'Computer Science / Informatics Practices',
        chapters: [
          'Computer System Overview',
          'Data Representation & Number Systems',
          'Boolean Logic',
          'Introduction to Problem Solving & Algorithms',
          'Getting Started with Python',
          'Python Control Flow (Loops & Conditionals)',
          'Python Data Structures (Strings, Lists, Tuples, Dictionaries)',
          'Cyber Safety and Society, Law and Ethics'
        ]
      },
      {
        id: 'Economics',
        name: 'Economics',
        chapters: [
          'Introduction to Microeconomics',
          'Consumer Equilibrium and Demand',
          'Producer Behaviour and Supply',
          'Forms of Market and Price Determination',
          'Statistics for Economics: Collection, Organisation & Presentation',
          'Measures of Central Tendency (Mean, Median, Mode)',
          'Correlation and Index Numbers'
        ]
      },
      {
        id: 'Accountancy',
        name: 'Accountancy',
        chapters: [
          'Introduction to Accounting & Basic Accounting Terms',
          'Theory Base of Accounting & Accounting Standards',
          'Recording of Transactions (Journal, Ledger, Cash Book)',
          'Bank Reconciliation Statement (BRS)',
          'Trial Balance and Rectification of Errors',
          'Depreciation, Provisions and Reserves',
          'Financial Statements of Sole Proprietorship'
        ]
      },
      {
        id: 'Business Studies',
        name: 'Business Studies',
        chapters: [
          'Nature and Purpose of Business',
          'Forms of Business Organisations',
          'Public, Private and Global Enterprises',
          'Business Services (Banking, Insurance)',
          'Emerging Modes of Business (e-Business)',
          'Social Responsibilities of Business and Business Ethics',
          'Sources of Business Finance',
          'Small Business and Enterprises',
          'Internal Trade & International Business'
        ]
      }
    ]
  },
  '12': {
    subjects: [
      {
        id: 'Physics',
        name: 'Physics',
        chapters: [
          'Electric Charges and Fields (Coulomb’s Law, Gauss’s Law)',
          'Electrostatic Potential and Capacitance',
          'Current Electricity (Kirchhoff’s Laws, Potentiometer)',
          'Moving Charges and Magnetism (Biot-Savart, Ampere’s Law)',
          'Magnetism and Matter',
          'Electromagnetic Induction (Faraday’s Law, Lenz’s Law)',
          'Alternating Current (LCR Circuits, Resonance, Power Factor)',
          'Electromagnetic Waves',
          'Ray Optics and Optical Instruments (Refraction, Lenses, Microscopes)',
          'Wave Optics (Huygens’ Principle, Interference, Diffraction)',
          'Dual Nature of Radiation and Matter (Photoelectric Effect)',
          'Atoms (Bohr Model, Hydrogen Spectrum)',
          'Nuclei (Nuclear Binding Energy, Fission, Fusion)',
          'Semiconductor Electronics (p-n Junction, Diodes, Logic Gates)'
        ]
      },
      {
        id: 'Chemistry',
        name: 'Chemistry',
        chapters: [
          'Solutions (Raoult’s Law, Colligative Properties, Van ’t Hoff Factor)',
          'Electrochemistry (Nernst Equation, Kohlrausch’s Law, Batteries)',
          'Chemical Kinetics (Rate Laws, Arrhenius Equation, Half Life)',
          'The d- and f-Block Elements (Transition Metals, Lanthanides)',
          'Coordination Compounds (Werner’s Theory, CFT, Isomerism)',
          'Haloalkanes and Haloarenes (SN1, SN2 Mechanisms)',
          'Alcohols, Phenols and Ethers',
          'Aldehydes, Ketones and Carboxylic Acids (Named Reactions)',
          'Amines (Diazo Compounds, Hoffmann Bromamide)',
          'Biomolecules (Carbohydrates, Proteins, Nucleic Acids)'
        ]
      },
      {
        id: 'Mathematics',
        name: 'Mathematics',
        chapters: [
          'Relations and Functions (Equivalence, Invertible Functions)',
          'Inverse Trigonometric Functions',
          'Matrices (Multiplication, Inverse, Row Operations)',
          'Determinants (Properties, Cramers, Adjoint)',
          'Continuity and Differentiability',
          'Application of Derivatives (Tangents, Maxima and Minima)',
          'Integrals (Definite & Indefinite Integration Techniques)',
          'Application of Integrals (Area under Curves)',
          'Differential Equations (Variable Separable, Homogeneous, Linear)',
          'Vector Algebra (Dot and Cross Products)',
          'Three Dimensional Geometry (Lines and Planes, Shortest Distance)',
          'Linear Programming (Graphical Optimization)',
          'Probability (Conditional Probability, Bayes’ Theorem)'
        ]
      },
      {
        id: 'Biology',
        name: 'Biology',
        chapters: [
          'Sexual Reproduction in Flowering Plants',
          'Human Reproduction',
          'Reproductive Health',
          'Principles of Inheritance and Variation (Mendelian Genetics)',
          'Molecular Basis of Inheritance (DNA Replication, Transcription, Translation)',
          'Evolution',
          'Human Health and Disease (Immunity, AIDS, Cancer)',
          'Microbes in Human Welfare',
          'Biotechnology: Principles and Processes',
          'Biotechnology and Its Applications',
          'Organisms and Populations',
          'Ecosystem',
          'Biodiversity and Conservation'
        ]
      },
      {
        id: 'Computer Science',
        name: 'Computer Science (Python)',
        chapters: [
          'Python Revision Tour (Loops, Strings, Lists, Dictionaries)',
          'Functions (Scope, Parameters, Recursion)',
          'File Handling (Text, Binary, CSV Files)',
          'Data Structures: Stacks and Queues',
          'Computer Networks (Topologies, Protocols, Internet, IP/MAC)',
          'Database Concepts and Structured Query Language (SQL)',
          'Interface Python with SQL Database'
        ]
      },
      {
        id: 'Economics',
        name: 'Economics (Macroeconomics & Indian Economy)',
        chapters: [
          'National Income and Related Aggregates',
          'Money and Banking (Central Bank, Credit Creation)',
          'Determination of Income and Employment (Multiplier, AD-AS)',
          'Government Budget and the Economy',
          'Balance of Payments and Foreign Exchange Rate',
          'Development Experience (1947-90) and Economic Reforms (1991)',
          'Current Challenges Facing Indian Economy (Poverty, Human Capital, Rural Development)',
          'Employment and Sustainable Development',
          'Comparative Development Experiences of India and its Neighbours'
        ]
      },
      {
        id: 'Accountancy',
        name: 'Accountancy',
        chapters: [
          'Accounting for Partnership: Basic Concepts & Goodwill',
          'Admission of a Partner',
          'Retirement and Death of a Partner',
          'Dissolution of a Partnership Firm',
          'Accounting for Share Capital (Issue, Forfeiture, Reissue)',
          'Accounting for Debentures',
          'Financial Statements of a Company & Financial Statement Analysis',
          'Accounting Ratios (Liquidity, Solvency, Profitability)',
          'Cash Flow Statement'
        ]
      },
      {
        id: 'Business Studies',
        name: 'Business Studies',
        chapters: [
          'Nature and Significance of Management',
          'Principles of Management (Fayol and Taylor)',
          'Business Environment',
          'Planning',
          'Organising',
          'Staffing',
          'Directing',
          'Controlling',
          'Financial Management',
          'Financial Markets (Capital and Money Market)',
          'Marketing Management',
          'Consumer Protection'
        ]
      }
    ]
  }
};

module.exports = {
  BOARDS,
  STATE_BOARDS,
  CLASSES,
  SYLLABUS
};
