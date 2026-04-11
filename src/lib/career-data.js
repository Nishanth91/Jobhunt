// Comprehensive mapping of job roles to required skills, career paths, and learning resources.
// Used by the Career Guidance page for template-based skill gap analysis.

const roleSkillsMap = {
  'Oracle DBA': {
    requiredSkills: [
      'Oracle Database', 'SQL', 'PL/SQL', 'Database Administration', 'Backup & Recovery',
      'Performance Tuning', 'Oracle RAC', 'Data Guard', 'RMAN', 'Oracle Enterprise Manager',
    ],
    advancedSkills: [
      'Oracle Cloud Infrastructure', 'Exadata', 'GoldenGate', 'ASM', 'Multitenant Architecture',
      'Database Security', 'Partitioning', 'Advanced Compression', 'Oracle APEX',
    ],
    emergingSkills: [
      'Oracle Autonomous Database', 'Cloud Migration', 'DevOps for DBAs', 'Infrastructure as Code',
      'Kubernetes for Databases', 'Database as a Service', 'AI/ML in Database Management',
    ],
    careerPath: [
      { level: 'Entry', title: 'Junior DBA', skills: ['SQL', 'Oracle Database', 'Backup & Recovery'] },
      { level: 'Mid', title: 'Oracle DBA', skills: ['PL/SQL', 'Performance Tuning', 'Oracle RAC'] },
      { level: 'Senior', title: 'Senior DBA / Lead DBA', skills: ['Data Guard', 'Exadata', 'Database Security'] },
      { level: 'Principal', title: 'Database Architect', skills: ['Cloud Migration', 'Multitenant Architecture', 'Enterprise Design'] },
      { level: 'Leadership', title: 'Director of Database Engineering', skills: ['Team Leadership', 'Strategy', 'Budget Management'] },
    ],
    resources: {
      'Oracle Database': [
        { title: 'Oracle Database Administration Full Course', url: 'https://www.youtube.com/watch?v=c1qJCImFRJQ', type: 'youtube', provider: 'YouTube' },
        { title: 'Oracle Database for Developers - Free Course', url: 'https://education.oracle.com/oracle-database-explorer', type: 'course', provider: 'Oracle Learning' },
        { title: 'Oracle Database Documentation', url: 'https://docs.oracle.com/en/database/', type: 'docs', provider: 'Oracle Docs' },
      ],
      'SQL': [
        { title: 'SQL Full Course for Beginners', url: 'https://www.youtube.com/watch?v=HXV3zeQKqGY', type: 'youtube', provider: 'freeCodeCamp' },
        { title: 'SQL for Data Science', url: 'https://www.coursera.org/learn/sql-for-data-science', type: 'course', provider: 'Coursera (Free Audit)' },
        { title: 'SQLBolt Interactive Tutorial', url: 'https://sqlbolt.com/', type: 'docs', provider: 'SQLBolt' },
      ],
      'PL/SQL': [
        { title: 'PL/SQL Tutorial for Beginners', url: 'https://www.youtube.com/watch?v=1HEhM2Wg7mM', type: 'youtube', provider: 'YouTube' },
        { title: 'Oracle PL/SQL Fundamentals', url: 'https://education.oracle.com/oracle-database-program-with-pl-sql', type: 'course', provider: 'Oracle Learning' },
        { title: 'PL/SQL Reference Guide', url: 'https://docs.oracle.com/en/database/oracle/oracle-database/19/lnpls/', type: 'docs', provider: 'Oracle Docs' },
      ],
      'Performance Tuning': [
        { title: 'Oracle Database Performance Tuning', url: 'https://www.youtube.com/watch?v=U1VDlXJw3z4', type: 'youtube', provider: 'YouTube' },
        { title: 'Database Performance Tuning Guide', url: 'https://docs.oracle.com/en/database/oracle/oracle-database/19/tgdba/', type: 'docs', provider: 'Oracle Docs' },
      ],
      'Oracle RAC': [
        { title: 'Oracle RAC Architecture Explained', url: 'https://www.youtube.com/watch?v=jqZGRwpSEaQ', type: 'youtube', provider: 'YouTube' },
        { title: 'Oracle RAC Admin Guide', url: 'https://docs.oracle.com/en/database/oracle/oracle-database/19/racad/', type: 'docs', provider: 'Oracle Docs' },
      ],
      'Oracle Cloud Infrastructure': [
        { title: 'OCI Foundations Full Course', url: 'https://www.youtube.com/watch?v=JKlMKS7g3HI', type: 'youtube', provider: 'YouTube' },
        { title: 'OCI Foundations Associate Certification', url: 'https://education.oracle.com/oracle-cloud-infrastructure-foundations-associate', type: 'course', provider: 'Oracle Learning (Free)' },
        { title: 'OCI Documentation', url: 'https://docs.oracle.com/en-us/iaas/Content/home.htm', type: 'docs', provider: 'Oracle Docs' },
      ],
      'Oracle Autonomous Database': [
        { title: 'Autonomous Database Workshop', url: 'https://www.youtube.com/watch?v=YKIGpFCfNUk', type: 'youtube', provider: 'Oracle' },
        { title: 'Always Free Autonomous Database', url: 'https://www.oracle.com/cloud/free/', type: 'course', provider: 'Oracle Cloud Free Tier' },
      ],
    },
  },

  'Production Engineer': {
    requiredSkills: [
      'Linux Administration', 'Networking', 'Shell Scripting', 'Python', 'Monitoring & Alerting',
      'Incident Management', 'Load Balancing', 'TCP/IP', 'DNS', 'System Troubleshooting',
    ],
    advancedSkills: [
      'Kubernetes', 'Docker', 'Terraform', 'CI/CD Pipelines', 'Configuration Management',
      'Distributed Systems', 'Capacity Planning', 'Service Mesh', 'Chaos Engineering',
    ],
    emergingSkills: [
      'SRE Practices', 'GitOps', 'eBPF', 'Platform Engineering', 'AIOps',
      'Observability (OpenTelemetry)', 'WebAssembly for Infrastructure',
    ],
    careerPath: [
      { level: 'Entry', title: 'Junior Production Engineer', skills: ['Linux', 'Shell Scripting', 'Monitoring'] },
      { level: 'Mid', title: 'Production Engineer', skills: ['Docker', 'Kubernetes', 'CI/CD'] },
      { level: 'Senior', title: 'Senior Production Engineer', skills: ['Distributed Systems', 'Terraform', 'Capacity Planning'] },
      { level: 'Principal', title: 'Staff Production Engineer', skills: ['Platform Engineering', 'Architecture', 'Chaos Engineering'] },
      { level: 'Leadership', title: 'Engineering Manager / Director', skills: ['Team Leadership', 'Strategy', 'Org Design'] },
    ],
    resources: {
      'Linux Administration': [
        { title: 'Linux Full Course for Beginners', url: 'https://www.youtube.com/watch?v=wBp0Rb-ZJak', type: 'youtube', provider: 'freeCodeCamp' },
        { title: 'Introduction to Linux', url: 'https://www.edx.org/learn/linux/the-linux-foundation-introduction-to-linux', type: 'course', provider: 'edX (Free)' },
        { title: 'Linux Journey', url: 'https://linuxjourney.com/', type: 'docs', provider: 'Linux Journey' },
      ],
      'Python': [
        { title: 'Python for Beginners Full Course', url: 'https://www.youtube.com/watch?v=rfscVS0vtbw', type: 'youtube', provider: 'freeCodeCamp' },
        { title: 'Python for Everybody', url: 'https://www.coursera.org/specializations/python', type: 'course', provider: 'Coursera (Free Audit)' },
        { title: 'Python Official Tutorial', url: 'https://docs.python.org/3/tutorial/', type: 'docs', provider: 'Python Docs' },
      ],
      'Kubernetes': [
        { title: 'Kubernetes Crash Course', url: 'https://www.youtube.com/watch?v=s_o8dwzRlu4', type: 'youtube', provider: 'TechWorld with Nana' },
        { title: 'Introduction to Kubernetes', url: 'https://www.edx.org/learn/kubernetes/the-linux-foundation-introduction-to-kubernetes', type: 'course', provider: 'edX (Free)' },
        { title: 'Kubernetes Documentation', url: 'https://kubernetes.io/docs/home/', type: 'docs', provider: 'Kubernetes.io' },
      ],
      'Docker': [
        { title: 'Docker Tutorial for Beginners', url: 'https://www.youtube.com/watch?v=fqMOX6JJhGo', type: 'youtube', provider: 'freeCodeCamp' },
        { title: 'Docker Getting Started', url: 'https://docs.docker.com/get-started/', type: 'docs', provider: 'Docker Docs' },
      ],
      'Terraform': [
        { title: 'Terraform in 100 Seconds + Tutorial', url: 'https://www.youtube.com/watch?v=tomUWcQ0P3k', type: 'youtube', provider: 'Fireship' },
        { title: 'HashiCorp Terraform Tutorials', url: 'https://developer.hashicorp.com/terraform/tutorials', type: 'docs', provider: 'HashiCorp' },
      ],
      'SRE Practices': [
        { title: 'Site Reliability Engineering (Google)', url: 'https://www.youtube.com/watch?v=uTEL8Ff1Zvk', type: 'youtube', provider: 'Google Cloud' },
        { title: 'Google SRE Book (Free Online)', url: 'https://sre.google/sre-book/table-of-contents/', type: 'docs', provider: 'Google SRE' },
      ],
    },
  },

  'Software Engineer': {
    requiredSkills: [
      'Data Structures & Algorithms', 'JavaScript', 'Python', 'Git', 'REST APIs',
      'SQL', 'Object-Oriented Programming', 'Unit Testing', 'Problem Solving', 'Agile Methodologies',
    ],
    advancedSkills: [
      'System Design', 'Microservices', 'Cloud Services (AWS/GCP/Azure)', 'Docker', 'CI/CD',
      'GraphQL', 'Performance Optimization', 'Security Best Practices', 'Design Patterns',
    ],
    emergingSkills: [
      'AI/ML Integration', 'Rust', 'WebAssembly', 'Edge Computing', 'LLM/GenAI Application Development',
      'Serverless Architecture', 'Web3/Blockchain Fundamentals',
    ],
    careerPath: [
      { level: 'Entry', title: 'Junior Software Engineer', skills: ['JavaScript', 'Python', 'Git', 'SQL'] },
      { level: 'Mid', title: 'Software Engineer', skills: ['System Design', 'REST APIs', 'Cloud Services'] },
      { level: 'Senior', title: 'Senior Software Engineer', skills: ['Microservices', 'Performance Optimization', 'Mentoring'] },
      { level: 'Principal', title: 'Staff / Principal Engineer', skills: ['Architecture', 'Technical Strategy', 'Cross-Team Influence'] },
      { level: 'Leadership', title: 'Engineering Manager / CTO', skills: ['Team Leadership', 'Product Vision', 'Org Design'] },
    ],
    resources: {
      'Data Structures & Algorithms': [
        { title: 'DSA Full Course by freeCodeCamp', url: 'https://www.youtube.com/watch?v=8hly31xKli0', type: 'youtube', provider: 'freeCodeCamp' },
        { title: 'Algorithms Specialization', url: 'https://www.coursera.org/specializations/algorithms', type: 'course', provider: 'Coursera (Free Audit)' },
        { title: 'NeetCode Roadmap', url: 'https://neetcode.io/roadmap', type: 'docs', provider: 'NeetCode' },
      ],
      'JavaScript': [
        { title: 'JavaScript Full Course', url: 'https://www.youtube.com/watch?v=PkZNo7MFNFg', type: 'youtube', provider: 'freeCodeCamp' },
        { title: 'freeCodeCamp JavaScript Certification', url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/', type: 'course', provider: 'freeCodeCamp' },
        { title: 'MDN JavaScript Guide', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide', type: 'docs', provider: 'MDN' },
      ],
      'Python': [
        { title: 'Python for Beginners Full Course', url: 'https://www.youtube.com/watch?v=rfscVS0vtbw', type: 'youtube', provider: 'freeCodeCamp' },
        { title: 'Python for Everybody', url: 'https://www.coursera.org/specializations/python', type: 'course', provider: 'Coursera (Free Audit)' },
        { title: 'Python Official Tutorial', url: 'https://docs.python.org/3/tutorial/', type: 'docs', provider: 'Python Docs' },
      ],
      'System Design': [
        { title: 'System Design for Beginners', url: 'https://www.youtube.com/watch?v=MbjObHmDbZo', type: 'youtube', provider: 'NeetCode' },
        { title: 'System Design Primer', url: 'https://github.com/donnemartin/system-design-primer', type: 'docs', provider: 'GitHub' },
      ],
      'AI/ML Integration': [
        { title: 'Machine Learning for Developers', url: 'https://www.youtube.com/watch?v=i_LwzRVP7bg', type: 'youtube', provider: 'freeCodeCamp' },
        { title: 'Machine Learning Crash Course', url: 'https://developers.google.com/machine-learning/crash-course', type: 'course', provider: 'Google (Free)' },
      ],
    },
  },

  'Frontend Developer': {
    requiredSkills: [
      'HTML', 'CSS', 'JavaScript', 'React', 'Responsive Design',
      'Git', 'TypeScript', 'REST APIs', 'Browser DevTools', 'Accessibility (a11y)',
    ],
    advancedSkills: [
      'Next.js', 'State Management (Redux/Zustand)', 'Testing (Jest/Cypress)', 'Performance Optimization',
      'Design Systems', 'Webpack/Vite', 'GraphQL', 'CSS-in-JS', 'Micro Frontends',
    ],
    emergingSkills: [
      'Server Components', 'Edge Rendering', 'AI-Powered UI', 'Web Components',
      'Motion Design (Framer Motion)', 'View Transitions API', 'Signals-based Reactivity',
    ],
    careerPath: [
      { level: 'Entry', title: 'Junior Frontend Developer', skills: ['HTML', 'CSS', 'JavaScript'] },
      { level: 'Mid', title: 'Frontend Developer', skills: ['React', 'TypeScript', 'Testing'] },
      { level: 'Senior', title: 'Senior Frontend Developer', skills: ['Next.js', 'Performance', 'Design Systems'] },
      { level: 'Principal', title: 'Frontend Architect', skills: ['Micro Frontends', 'Technical Strategy', 'Platform Design'] },
      { level: 'Leadership', title: 'Engineering Manager', skills: ['Team Leadership', 'Product Collaboration', 'Hiring'] },
    ],
    resources: {
      'React': [
        { title: 'React Course for Beginners', url: 'https://www.youtube.com/watch?v=bMknfKXIFA8', type: 'youtube', provider: 'freeCodeCamp' },
        { title: 'React Official Tutorial', url: 'https://react.dev/learn', type: 'docs', provider: 'React.dev' },
      ],
      'TypeScript': [
        { title: 'TypeScript Full Course', url: 'https://www.youtube.com/watch?v=30LWjhZzg50', type: 'youtube', provider: 'freeCodeCamp' },
        { title: 'TypeScript Handbook', url: 'https://www.typescriptlang.org/docs/handbook/', type: 'docs', provider: 'TypeScript Docs' },
      ],
      'Next.js': [
        { title: 'Next.js Full Tutorial', url: 'https://www.youtube.com/watch?v=wm5gMKuwSYk', type: 'youtube', provider: 'freeCodeCamp' },
        { title: 'Next.js Official Learn Course', url: 'https://nextjs.org/learn', type: 'course', provider: 'Vercel (Free)' },
        { title: 'Next.js Documentation', url: 'https://nextjs.org/docs', type: 'docs', provider: 'Next.js Docs' },
      ],
      'CSS': [
        { title: 'CSS Full Course', url: 'https://www.youtube.com/watch?v=1Rs2ND1ryYc', type: 'youtube', provider: 'freeCodeCamp' },
        { title: 'freeCodeCamp Responsive Design Certification', url: 'https://www.freecodecamp.org/learn/responsive-web-design/', type: 'course', provider: 'freeCodeCamp' },
      ],
    },
  },

  'Backend Developer': {
    requiredSkills: [
      'Node.js', 'Python', 'SQL', 'REST APIs', 'Git',
      'Database Design', 'Authentication & Authorization', 'Linux Basics', 'Data Structures', 'Testing',
    ],
    advancedSkills: [
      'Microservices', 'Message Queues (Kafka/RabbitMQ)', 'Docker', 'Kubernetes', 'GraphQL',
      'Caching (Redis)', 'CI/CD', 'Monitoring & Logging', 'System Design',
    ],
    emergingSkills: [
      'Serverless', 'Event-Driven Architecture', 'gRPC', 'Rust for Backend',
      'AI/ML APIs', 'Edge Functions', 'Database Sharding at Scale',
    ],
    careerPath: [
      { level: 'Entry', title: 'Junior Backend Developer', skills: ['Node.js/Python', 'SQL', 'REST APIs'] },
      { level: 'Mid', title: 'Backend Developer', skills: ['Docker', 'Microservices', 'Database Design'] },
      { level: 'Senior', title: 'Senior Backend Developer', skills: ['System Design', 'Kubernetes', 'Performance'] },
      { level: 'Principal', title: 'Backend Architect', skills: ['Distributed Systems', 'Platform Design', 'Technical Leadership'] },
      { level: 'Leadership', title: 'VP of Engineering', skills: ['Org Strategy', 'Cross-Functional Leadership', 'Scaling Teams'] },
    ],
    resources: {
      'Node.js': [
        { title: 'Node.js Full Course', url: 'https://www.youtube.com/watch?v=Oe421EPjeBE', type: 'youtube', provider: 'freeCodeCamp' },
        { title: 'Node.js Documentation', url: 'https://nodejs.org/en/docs/guides', type: 'docs', provider: 'Node.js' },
      ],
      'Docker': [
        { title: 'Docker Tutorial for Beginners', url: 'https://www.youtube.com/watch?v=fqMOX6JJhGo', type: 'youtube', provider: 'freeCodeCamp' },
        { title: 'Docker Getting Started', url: 'https://docs.docker.com/get-started/', type: 'docs', provider: 'Docker Docs' },
      ],
      'Microservices': [
        { title: 'Microservices Explained in 5 Minutes', url: 'https://www.youtube.com/watch?v=lL_j7ilk7rc', type: 'youtube', provider: 'TechWorld with Nana' },
        { title: 'Microservices.io Patterns', url: 'https://microservices.io/patterns/', type: 'docs', provider: 'Microservices.io' },
      ],
      'System Design': [
        { title: 'System Design for Beginners', url: 'https://www.youtube.com/watch?v=MbjObHmDbZo', type: 'youtube', provider: 'NeetCode' },
        { title: 'System Design Primer', url: 'https://github.com/donnemartin/system-design-primer', type: 'docs', provider: 'GitHub' },
      ],
    },
  },

  'Full Stack Developer': {
    requiredSkills: [
      'JavaScript', 'React', 'Node.js', 'SQL', 'HTML/CSS',
      'Git', 'REST APIs', 'TypeScript', 'Database Management', 'Authentication',
    ],
    advancedSkills: [
      'Next.js', 'Docker', 'Cloud Services (AWS/Vercel)', 'GraphQL', 'CI/CD',
      'Testing (Unit + E2E)', 'State Management', 'WebSockets', 'Caching Strategies',
    ],
    emergingSkills: [
      'AI Integration', 'Edge Computing', 'Server Components', 'tRPC',
      'Bun Runtime', 'Serverless Databases', 'AI-Assisted Development',
    ],
    careerPath: [
      { level: 'Entry', title: 'Junior Full Stack Developer', skills: ['HTML/CSS', 'JavaScript', 'SQL'] },
      { level: 'Mid', title: 'Full Stack Developer', skills: ['React', 'Node.js', 'REST APIs'] },
      { level: 'Senior', title: 'Senior Full Stack Developer', skills: ['Next.js', 'System Design', 'DevOps'] },
      { level: 'Principal', title: 'Technical Lead / Architect', skills: ['Architecture', 'Cross-Team Collaboration', 'Scaling'] },
      { level: 'Leadership', title: 'CTO / VP of Engineering', skills: ['Product Strategy', 'Team Building', 'Business Alignment'] },
    ],
    resources: {
      'React': [
        { title: 'React Course for Beginners', url: 'https://www.youtube.com/watch?v=bMknfKXIFA8', type: 'youtube', provider: 'freeCodeCamp' },
        { title: 'React Official Tutorial', url: 'https://react.dev/learn', type: 'docs', provider: 'React.dev' },
      ],
      'Node.js': [
        { title: 'Node.js Full Course', url: 'https://www.youtube.com/watch?v=Oe421EPjeBE', type: 'youtube', provider: 'freeCodeCamp' },
        { title: 'Node.js Documentation', url: 'https://nodejs.org/en/docs/guides', type: 'docs', provider: 'Node.js' },
      ],
      'Next.js': [
        { title: 'Next.js Full Tutorial', url: 'https://www.youtube.com/watch?v=wm5gMKuwSYk', type: 'youtube', provider: 'freeCodeCamp' },
        { title: 'Next.js Official Learn Course', url: 'https://nextjs.org/learn', type: 'course', provider: 'Vercel (Free)' },
      ],
    },
  },

  'Data Analyst': {
    requiredSkills: [
      'SQL', 'Excel/Google Sheets', 'Data Visualization', 'Python', 'Statistics',
      'Tableau/Power BI', 'Data Cleaning', 'Reporting', 'Business Acumen', 'Communication',
    ],
    advancedSkills: [
      'R', 'Machine Learning Basics', 'ETL Pipelines', 'A/B Testing', 'Advanced Statistics',
      'dbt', 'Airflow', 'Data Warehousing', 'Looker/Metabase',
    ],
    emergingSkills: [
      'AI-Assisted Analytics', 'Real-time Dashboards', 'Data Mesh', 'Reverse ETL',
      'Natural Language Querying', 'LLM for Data Analysis', 'DataOps',
    ],
    careerPath: [
      { level: 'Entry', title: 'Junior Data Analyst', skills: ['SQL', 'Excel', 'Reporting'] },
      { level: 'Mid', title: 'Data Analyst', skills: ['Python', 'Tableau/Power BI', 'Statistics'] },
      { level: 'Senior', title: 'Senior Data Analyst', skills: ['A/B Testing', 'Data Warehousing', 'ETL'] },
      { level: 'Principal', title: 'Lead Analyst / Analytics Engineer', skills: ['dbt', 'Data Modeling', 'Technical Leadership'] },
      { level: 'Leadership', title: 'Head of Analytics / Director', skills: ['Data Strategy', 'Team Management', 'Stakeholder Management'] },
    ],
    resources: {
      'SQL': [
        { title: 'SQL Full Course for Beginners', url: 'https://www.youtube.com/watch?v=HXV3zeQKqGY', type: 'youtube', provider: 'freeCodeCamp' },
        { title: 'SQL for Data Science', url: 'https://www.coursera.org/learn/sql-for-data-science', type: 'course', provider: 'Coursera (Free Audit)' },
        { title: 'SQLBolt Interactive Tutorial', url: 'https://sqlbolt.com/', type: 'docs', provider: 'SQLBolt' },
      ],
      'Python': [
        { title: 'Python for Data Analysis', url: 'https://www.youtube.com/watch?v=r-uOLxNrNk8', type: 'youtube', provider: 'freeCodeCamp' },
        { title: 'Python for Everybody', url: 'https://www.coursera.org/specializations/python', type: 'course', provider: 'Coursera (Free Audit)' },
        { title: 'Pandas Documentation', url: 'https://pandas.pydata.org/docs/getting_started/', type: 'docs', provider: 'Pandas' },
      ],
      'Tableau/Power BI': [
        { title: 'Tableau Full Course', url: 'https://www.youtube.com/watch?v=aHaOIvR00So', type: 'youtube', provider: 'freeCodeCamp' },
        { title: 'Google Data Analytics Certificate', url: 'https://www.coursera.org/professional-certificates/google-data-analytics', type: 'course', provider: 'Coursera (Free Audit)' },
      ],
      'Statistics': [
        { title: 'Statistics Fundamentals', url: 'https://www.youtube.com/watch?v=xxpc-HPKN28', type: 'youtube', provider: 'StatQuest' },
        { title: 'Intro to Statistics', url: 'https://www.khanacademy.org/math/statistics-probability', type: 'course', provider: 'Khan Academy (Free)' },
      ],
    },
  },

  'Data Scientist': {
    requiredSkills: [
      'Python', 'Statistics', 'Machine Learning', 'SQL', 'Data Visualization',
      'Pandas/NumPy', 'Scikit-learn', 'Jupyter Notebooks', 'Feature Engineering', 'Communication',
    ],
    advancedSkills: [
      'Deep Learning (TensorFlow/PyTorch)', 'NLP', 'Computer Vision', 'Big Data (Spark)',
      'MLOps', 'Bayesian Statistics', 'Time Series Analysis', 'Experiment Design',
    ],
    emergingSkills: [
      'Large Language Models', 'Generative AI', 'MLOps Platforms', 'Responsible AI',
      'AutoML', 'Causal Inference', 'Synthetic Data Generation',
    ],
    careerPath: [
      { level: 'Entry', title: 'Junior Data Scientist', skills: ['Python', 'SQL', 'Statistics'] },
      { level: 'Mid', title: 'Data Scientist', skills: ['Machine Learning', 'Feature Engineering', 'NLP'] },
      { level: 'Senior', title: 'Senior Data Scientist', skills: ['Deep Learning', 'MLOps', 'Experiment Design'] },
      { level: 'Principal', title: 'Staff Data Scientist / ML Architect', skills: ['System Design for ML', 'Research', 'Cross-Org Impact'] },
      { level: 'Leadership', title: 'Head of Data Science / VP', skills: ['Research Strategy', 'Team Building', 'Business Impact'] },
    ],
    resources: {
      'Machine Learning': [
        { title: 'Machine Learning Full Course', url: 'https://www.youtube.com/watch?v=i_LwzRVP7bg', type: 'youtube', provider: 'freeCodeCamp' },
        { title: 'Machine Learning by Andrew Ng', url: 'https://www.coursera.org/learn/machine-learning', type: 'course', provider: 'Coursera (Free Audit)' },
        { title: 'Google ML Crash Course', url: 'https://developers.google.com/machine-learning/crash-course', type: 'course', provider: 'Google (Free)' },
      ],
      'Deep Learning (TensorFlow/PyTorch)': [
        { title: 'Deep Learning Crash Course', url: 'https://www.youtube.com/watch?v=VyWAvY2CF9c', type: 'youtube', provider: 'freeCodeCamp' },
        { title: 'Deep Learning Specialization', url: 'https://www.coursera.org/specializations/deep-learning', type: 'course', provider: 'Coursera (Free Audit)' },
        { title: 'PyTorch Tutorials', url: 'https://pytorch.org/tutorials/', type: 'docs', provider: 'PyTorch' },
      ],
      'Large Language Models': [
        { title: 'LLM Explained Simply', url: 'https://www.youtube.com/watch?v=zjkBMFhNj_g', type: 'youtube', provider: 'YouTube' },
        { title: 'Hugging Face NLP Course', url: 'https://huggingface.co/learn/nlp-course', type: 'course', provider: 'Hugging Face (Free)' },
      ],
    },
  },

  'DevOps Engineer': {
    requiredSkills: [
      'Linux', 'Docker', 'CI/CD', 'Git', 'Shell Scripting',
      'Cloud Platforms (AWS/GCP/Azure)', 'Networking', 'Monitoring', 'Python/Go', 'Infrastructure as Code',
    ],
    advancedSkills: [
      'Kubernetes', 'Terraform', 'Ansible', 'Service Mesh (Istio)', 'Security (DevSecOps)',
      'ArgoCD/Flux', 'Helm', 'Prometheus/Grafana', 'Log Management (ELK)',
    ],
    emergingSkills: [
      'Platform Engineering', 'GitOps', 'eBPF', 'Policy as Code (OPA)',
      'AI for DevOps (AIOps)', 'Green Computing', 'Internal Developer Platforms',
    ],
    careerPath: [
      { level: 'Entry', title: 'Junior DevOps Engineer', skills: ['Linux', 'Git', 'Docker'] },
      { level: 'Mid', title: 'DevOps Engineer', skills: ['Kubernetes', 'CI/CD', 'Terraform'] },
      { level: 'Senior', title: 'Senior DevOps Engineer', skills: ['Security', 'Architecture', 'Automation'] },
      { level: 'Principal', title: 'Platform Engineer / DevOps Architect', skills: ['Platform Design', 'Developer Experience', 'Scale'] },
      { level: 'Leadership', title: 'Director of Infrastructure', skills: ['Strategy', 'Budget Management', 'Vendor Relations'] },
    ],
    resources: {
      'Docker': [
        { title: 'Docker Tutorial for Beginners', url: 'https://www.youtube.com/watch?v=fqMOX6JJhGo', type: 'youtube', provider: 'freeCodeCamp' },
        { title: 'Docker Getting Started', url: 'https://docs.docker.com/get-started/', type: 'docs', provider: 'Docker Docs' },
      ],
      'Kubernetes': [
        { title: 'Kubernetes Crash Course', url: 'https://www.youtube.com/watch?v=s_o8dwzRlu4', type: 'youtube', provider: 'TechWorld with Nana' },
        { title: 'Introduction to Kubernetes', url: 'https://www.edx.org/learn/kubernetes/the-linux-foundation-introduction-to-kubernetes', type: 'course', provider: 'edX (Free)' },
        { title: 'Kubernetes Documentation', url: 'https://kubernetes.io/docs/home/', type: 'docs', provider: 'Kubernetes.io' },
      ],
      'Terraform': [
        { title: 'Terraform Full Course', url: 'https://www.youtube.com/watch?v=tomUWcQ0P3k', type: 'youtube', provider: 'Fireship' },
        { title: 'HashiCorp Terraform Tutorials', url: 'https://developer.hashicorp.com/terraform/tutorials', type: 'docs', provider: 'HashiCorp' },
      ],
      'CI/CD': [
        { title: 'GitHub Actions Tutorial', url: 'https://www.youtube.com/watch?v=R8_veQiYBjI', type: 'youtube', provider: 'TechWorld with Nana' },
        { title: 'GitHub Actions Documentation', url: 'https://docs.github.com/en/actions', type: 'docs', provider: 'GitHub Docs' },
      ],
    },
  },

  'Project Manager': {
    requiredSkills: [
      'Project Planning', 'Agile/Scrum', 'Stakeholder Management', 'Risk Management', 'Communication',
      'JIRA/Asana', 'Budgeting', 'Resource Management', 'Documentation', 'Problem Solving',
    ],
    advancedSkills: [
      'Program Management', 'Change Management', 'Lean Six Sigma', 'Vendor Management',
      'Portfolio Management', 'Advanced Analytics', 'Conflict Resolution', 'Negotiation',
    ],
    emergingSkills: [
      'AI-Powered Project Tools', 'Remote Team Management', 'OKR Frameworks',
      'Product-Led Growth', 'Data-Driven Decision Making', 'Hybrid Methodologies',
    ],
    careerPath: [
      { level: 'Entry', title: 'Project Coordinator', skills: ['JIRA/Asana', 'Documentation', 'Communication'] },
      { level: 'Mid', title: 'Project Manager', skills: ['Agile/Scrum', 'Risk Management', 'Budgeting'] },
      { level: 'Senior', title: 'Senior Project Manager', skills: ['Program Management', 'Stakeholder Management', 'Change Management'] },
      { level: 'Principal', title: 'Program Director', skills: ['Portfolio Management', 'Strategy', 'Executive Communication'] },
      { level: 'Leadership', title: 'VP of Operations / COO', skills: ['Organizational Strategy', 'P&L Management', 'Board Relations'] },
    ],
    resources: {
      'Agile/Scrum': [
        { title: 'Agile Project Management Full Course', url: 'https://www.youtube.com/watch?v=ZVNBg98VHAU', type: 'youtube', provider: 'YouTube' },
        { title: 'Google Project Management Certificate', url: 'https://www.coursera.org/professional-certificates/google-project-management', type: 'course', provider: 'Coursera (Free Audit)' },
        { title: 'Scrum Guide', url: 'https://scrumguides.org/', type: 'docs', provider: 'Scrum.org' },
      ],
      'JIRA/Asana': [
        { title: 'JIRA Tutorial for Beginners', url: 'https://www.youtube.com/watch?v=uM_m6EzMg3k', type: 'youtube', provider: 'YouTube' },
        { title: 'Atlassian JIRA Guides', url: 'https://www.atlassian.com/software/jira/guides', type: 'docs', provider: 'Atlassian' },
      ],
      'Risk Management': [
        { title: 'Risk Management in Projects', url: 'https://www.youtube.com/watch?v=6Cf8nsLDQ4A', type: 'youtube', provider: 'YouTube' },
        { title: 'PMI Risk Management Guide', url: 'https://www.pmi.org/learning/library', type: 'docs', provider: 'PMI' },
      ],
    },
  },

  'Product Manager': {
    requiredSkills: [
      'Product Strategy', 'User Research', 'Roadmap Planning', 'Data Analysis', 'Communication',
      'Agile Methodologies', 'Wireframing', 'A/B Testing', 'Market Analysis', 'Prioritization Frameworks',
    ],
    advancedSkills: [
      'SQL', 'Growth Hacking', 'Pricing Strategy', 'Go-to-Market Strategy', 'Technical Architecture Basics',
      'Advanced Analytics', 'Product-Led Growth', 'Platform Thinking',
    ],
    emergingSkills: [
      'AI Product Management', 'Prompt Engineering', 'Ethical AI', 'Voice/Conversational UI',
      'Sustainability Metrics', 'Community-Led Growth',
    ],
    careerPath: [
      { level: 'Entry', title: 'Associate Product Manager', skills: ['User Research', 'Data Analysis', 'Wireframing'] },
      { level: 'Mid', title: 'Product Manager', skills: ['Roadmap Planning', 'A/B Testing', 'Agile'] },
      { level: 'Senior', title: 'Senior Product Manager', skills: ['Product Strategy', 'Go-to-Market', 'Pricing'] },
      { level: 'Principal', title: 'Director of Product', skills: ['Portfolio Strategy', 'Executive Alignment', 'Org Design'] },
      { level: 'Leadership', title: 'VP of Product / CPO', skills: ['Company Strategy', 'Board Presentations', 'Vision Setting'] },
    ],
    resources: {
      'Product Strategy': [
        { title: 'Product Management Full Course', url: 'https://www.youtube.com/watch?v=kDk6R1BDkLo', type: 'youtube', provider: 'YouTube' },
        { title: 'Digital Product Management', url: 'https://www.coursera.org/learn/uva-darden-digital-product-management', type: 'course', provider: 'Coursera (Free Audit)' },
      ],
      'User Research': [
        { title: 'UX Research for Beginners', url: 'https://www.youtube.com/watch?v=zGaGSGlE_0c', type: 'youtube', provider: 'YouTube' },
        { title: 'Google UX Design Certificate', url: 'https://www.coursera.org/professional-certificates/google-ux-design', type: 'course', provider: 'Coursera (Free Audit)' },
      ],
    },
  },

  'UX Designer': {
    requiredSkills: [
      'User Research', 'Wireframing', 'Prototyping', 'Figma', 'Usability Testing',
      'Information Architecture', 'Visual Design', 'Design Thinking', 'Accessibility', 'Communication',
    ],
    advancedSkills: [
      'Design Systems', 'Motion Design', 'Data-Driven Design', 'Advanced Prototyping',
      'Service Design', 'Content Strategy', 'Cross-Platform Design', 'Design Leadership',
    ],
    emergingSkills: [
      'AI-Powered Design Tools', 'Voice UI Design', 'AR/VR UX', 'Generative Design',
      'Ethical Design', 'Spatial Computing UX',
    ],
    careerPath: [
      { level: 'Entry', title: 'Junior UX Designer', skills: ['Wireframing', 'Figma', 'User Research'] },
      { level: 'Mid', title: 'UX Designer', skills: ['Prototyping', 'Usability Testing', 'Design Thinking'] },
      { level: 'Senior', title: 'Senior UX Designer', skills: ['Design Systems', 'Data-Driven Design', 'Mentoring'] },
      { level: 'Principal', title: 'UX Lead / Design Director', skills: ['Design Strategy', 'Cross-Functional Leadership', 'Vision'] },
      { level: 'Leadership', title: 'VP of Design / CDO', skills: ['Org Design', 'Brand Strategy', 'Executive Communication'] },
    ],
    resources: {
      'Figma': [
        { title: 'Figma Full Course', url: 'https://www.youtube.com/watch?v=jwCmIBJ8Jtc', type: 'youtube', provider: 'freeCodeCamp' },
        { title: 'Figma Official Tutorials', url: 'https://help.figma.com/hc/en-us/categories/360002051613-Get-started', type: 'docs', provider: 'Figma' },
      ],
      'User Research': [
        { title: 'UX Research Methods', url: 'https://www.youtube.com/watch?v=zGaGSGlE_0c', type: 'youtube', provider: 'YouTube' },
        { title: 'Google UX Design Certificate', url: 'https://www.coursera.org/professional-certificates/google-ux-design', type: 'course', provider: 'Coursera (Free Audit)' },
        { title: 'NN/g UX Articles', url: 'https://www.nngroup.com/articles/', type: 'docs', provider: 'Nielsen Norman Group' },
      ],
    },
  },

  'Machine Learning Engineer': {
    requiredSkills: [
      'Python', 'Machine Learning', 'Deep Learning', 'Mathematics (Linear Algebra/Calculus)',
      'TensorFlow/PyTorch', 'Data Preprocessing', 'SQL', 'Git', 'Statistics', 'Model Evaluation',
    ],
    advancedSkills: [
      'MLOps', 'Model Deployment', 'Distributed Training', 'Feature Stores',
      'Kubernetes', 'Model Optimization', 'NLP/Computer Vision', 'A/B Testing',
    ],
    emergingSkills: [
      'LLM Fine-Tuning', 'RAG Architecture', 'RLHF', 'Model Quantization',
      'Edge ML', 'Responsible AI', 'Multimodal AI',
    ],
    careerPath: [
      { level: 'Entry', title: 'Junior ML Engineer', skills: ['Python', 'ML Basics', 'SQL'] },
      { level: 'Mid', title: 'Machine Learning Engineer', skills: ['Deep Learning', 'Model Deployment', 'MLOps'] },
      { level: 'Senior', title: 'Senior ML Engineer', skills: ['Distributed Training', 'System Design for ML', 'Research'] },
      { level: 'Principal', title: 'Staff ML Engineer / ML Architect', skills: ['Architecture', 'Innovation', 'Cross-Org Impact'] },
      { level: 'Leadership', title: 'Head of ML / VP of AI', skills: ['AI Strategy', 'Team Building', 'Business Alignment'] },
    ],
    resources: {
      'Machine Learning': [
        { title: 'Machine Learning Full Course', url: 'https://www.youtube.com/watch?v=i_LwzRVP7bg', type: 'youtube', provider: 'freeCodeCamp' },
        { title: 'Machine Learning by Andrew Ng', url: 'https://www.coursera.org/learn/machine-learning', type: 'course', provider: 'Coursera (Free Audit)' },
      ],
      'TensorFlow/PyTorch': [
        { title: 'TensorFlow 2.0 Complete Course', url: 'https://www.youtube.com/watch?v=tPYj3fFJGjk', type: 'youtube', provider: 'freeCodeCamp' },
        { title: 'PyTorch Tutorials', url: 'https://pytorch.org/tutorials/', type: 'docs', provider: 'PyTorch' },
      ],
      'LLM Fine-Tuning': [
        { title: 'Fine-Tuning LLMs Explained', url: 'https://www.youtube.com/watch?v=eC6Hd1hFvos', type: 'youtube', provider: 'YouTube' },
        { title: 'Hugging Face NLP Course', url: 'https://huggingface.co/learn/nlp-course', type: 'course', provider: 'Hugging Face (Free)' },
      ],
    },
  },

  'Cybersecurity Analyst': {
    requiredSkills: [
      'Network Security', 'Linux', 'Firewalls & IDS/IPS', 'SIEM Tools', 'Vulnerability Assessment',
      'Incident Response', 'Security Frameworks (NIST/ISO)', 'TCP/IP', 'Cryptography Basics', 'Risk Assessment',
    ],
    advancedSkills: [
      'Penetration Testing', 'Cloud Security', 'Threat Hunting', 'Malware Analysis',
      'SOAR', 'Zero Trust Architecture', 'Security Automation', 'Forensics',
    ],
    emergingSkills: [
      'AI for Security (AI-SOC)', 'DevSecOps', 'Quantum Cryptography', 'Supply Chain Security',
      'Privacy Engineering', 'Threat Intelligence Automation',
    ],
    careerPath: [
      { level: 'Entry', title: 'Junior Security Analyst', skills: ['Network Security', 'SIEM', 'Linux'] },
      { level: 'Mid', title: 'Cybersecurity Analyst', skills: ['Incident Response', 'Vulnerability Assessment', 'Firewalls'] },
      { level: 'Senior', title: 'Senior Security Engineer', skills: ['Penetration Testing', 'Cloud Security', 'Threat Hunting'] },
      { level: 'Principal', title: 'Security Architect', skills: ['Zero Trust', 'Architecture', 'Compliance'] },
      { level: 'Leadership', title: 'CISO', skills: ['Security Strategy', 'Risk Management', 'Board Communication'] },
    ],
    resources: {
      'Network Security': [
        { title: 'Network Security Full Course', url: 'https://www.youtube.com/watch?v=qiQR5rTSshw', type: 'youtube', provider: 'freeCodeCamp' },
        { title: 'Google Cybersecurity Certificate', url: 'https://www.coursera.org/professional-certificates/google-cybersecurity', type: 'course', provider: 'Coursera (Free Audit)' },
      ],
      'Penetration Testing': [
        { title: 'Ethical Hacking Full Course', url: 'https://www.youtube.com/watch?v=3Kq1MIfTWCE', type: 'youtube', provider: 'freeCodeCamp' },
        { title: 'TryHackMe (Free Rooms)', url: 'https://tryhackme.com/', type: 'course', provider: 'TryHackMe' },
      ],
    },
  },

  'Cloud Engineer': {
    requiredSkills: [
      'AWS/GCP/Azure', 'Linux', 'Networking', 'Docker', 'Infrastructure as Code',
      'CI/CD', 'Python/Bash Scripting', 'Security Basics', 'Load Balancing', 'Storage Services',
    ],
    advancedSkills: [
      'Kubernetes', 'Terraform', 'Serverless', 'Multi-Cloud Architecture', 'Cost Optimization',
      'Monitoring & Observability', 'Disaster Recovery', 'Compliance (SOC2/HIPAA)',
    ],
    emergingSkills: [
      'FinOps', 'Green Cloud Computing', 'AI/ML Cloud Services', 'Edge Cloud',
      'Platform Engineering', 'Cloud-Native Security',
    ],
    careerPath: [
      { level: 'Entry', title: 'Junior Cloud Engineer', skills: ['AWS/GCP', 'Linux', 'Docker'] },
      { level: 'Mid', title: 'Cloud Engineer', skills: ['Kubernetes', 'Terraform', 'CI/CD'] },
      { level: 'Senior', title: 'Senior Cloud Engineer', skills: ['Multi-Cloud', 'Security', 'Cost Optimization'] },
      { level: 'Principal', title: 'Cloud Architect', skills: ['Architecture', 'Disaster Recovery', 'Compliance'] },
      { level: 'Leadership', title: 'Director of Cloud Infrastructure', skills: ['Strategy', 'Vendor Management', 'Budget'] },
    ],
    resources: {
      'AWS/GCP/Azure': [
        { title: 'AWS Certified Cloud Practitioner', url: 'https://www.youtube.com/watch?v=SOTamWNgDKc', type: 'youtube', provider: 'freeCodeCamp' },
        { title: 'AWS Cloud Practitioner Essentials', url: 'https://www.coursera.org/learn/aws-cloud-practitioner-essentials', type: 'course', provider: 'Coursera (Free Audit)' },
        { title: 'AWS Documentation', url: 'https://docs.aws.amazon.com/', type: 'docs', provider: 'AWS' },
      ],
      'Terraform': [
        { title: 'Terraform Full Course', url: 'https://www.youtube.com/watch?v=tomUWcQ0P3k', type: 'youtube', provider: 'Fireship' },
        { title: 'HashiCorp Terraform Tutorials', url: 'https://developer.hashicorp.com/terraform/tutorials', type: 'docs', provider: 'HashiCorp' },
      ],
    },
  },

  'Business Analyst': {
    requiredSkills: [
      'Requirements Gathering', 'SQL', 'Business Process Modeling', 'Data Analysis', 'Communication',
      'Stakeholder Management', 'Documentation', 'Agile Methodologies', 'Excel', 'Problem Solving',
    ],
    advancedSkills: [
      'Power BI/Tableau', 'UML Diagrams', 'Process Automation', 'Change Management',
      'Domain Knowledge', 'Financial Modeling', 'API Understanding', 'Data Warehousing',
    ],
    emergingSkills: [
      'AI-Assisted Analysis', 'Low-Code/No-Code Platforms', 'Citizen Data Science',
      'Process Mining', 'Digital Transformation Strategy',
    ],
    careerPath: [
      { level: 'Entry', title: 'Junior Business Analyst', skills: ['Requirements Gathering', 'Documentation', 'Excel'] },
      { level: 'Mid', title: 'Business Analyst', skills: ['SQL', 'Data Analysis', 'Stakeholder Management'] },
      { level: 'Senior', title: 'Senior Business Analyst', skills: ['Power BI', 'Process Automation', 'Change Management'] },
      { level: 'Principal', title: 'Lead BA / BA Manager', skills: ['Strategy', 'Domain Expertise', 'Team Leadership'] },
      { level: 'Leadership', title: 'Director of Business Analysis', skills: ['Digital Strategy', 'Org Transformation', 'Executive Influence'] },
    ],
    resources: {
      'SQL': [
        { title: 'SQL Full Course for Beginners', url: 'https://www.youtube.com/watch?v=HXV3zeQKqGY', type: 'youtube', provider: 'freeCodeCamp' },
        { title: 'SQL for Data Science', url: 'https://www.coursera.org/learn/sql-for-data-science', type: 'course', provider: 'Coursera (Free Audit)' },
      ],
      'Requirements Gathering': [
        { title: 'Business Analysis Full Course', url: 'https://www.youtube.com/watch?v=ZVNBg98VHAU', type: 'youtube', provider: 'YouTube' },
        { title: 'IIBA BABOK Guide', url: 'https://www.iiba.org/babok-guide/', type: 'docs', provider: 'IIBA' },
      ],
    },
  },

  'Marketing Manager': {
    requiredSkills: [
      'Digital Marketing', 'SEO/SEM', 'Content Strategy', 'Social Media Marketing', 'Analytics',
      'Email Marketing', 'Brand Management', 'Campaign Management', 'Communication', 'Budgeting',
    ],
    advancedSkills: [
      'Marketing Automation', 'CRM (HubSpot/Salesforce)', 'Conversion Optimization', 'Paid Media',
      'Influencer Marketing', 'Marketing Attribution', 'Customer Segmentation',
    ],
    emergingSkills: [
      'AI-Powered Marketing', 'Privacy-First Marketing', 'Conversational Marketing',
      'Short-Form Video Strategy', 'Community-Led Growth', 'Programmatic Advertising',
    ],
    careerPath: [
      { level: 'Entry', title: 'Marketing Coordinator', skills: ['Social Media', 'Email Marketing', 'Analytics'] },
      { level: 'Mid', title: 'Marketing Manager', skills: ['SEO/SEM', 'Campaign Management', 'Content Strategy'] },
      { level: 'Senior', title: 'Senior Marketing Manager', skills: ['Marketing Automation', 'Paid Media', 'Attribution'] },
      { level: 'Principal', title: 'Director of Marketing', skills: ['Brand Strategy', 'Team Leadership', 'Budget Management'] },
      { level: 'Leadership', title: 'VP of Marketing / CMO', skills: ['Growth Strategy', 'Executive Communication', 'Revenue Impact'] },
    ],
    resources: {
      'Digital Marketing': [
        { title: 'Digital Marketing Full Course', url: 'https://www.youtube.com/watch?v=hiEb1m7F01g', type: 'youtube', provider: 'YouTube' },
        { title: 'Google Digital Marketing Certificate', url: 'https://www.coursera.org/professional-certificates/google-digital-marketing-ecommerce', type: 'course', provider: 'Coursera (Free Audit)' },
      ],
      'SEO/SEM': [
        { title: 'SEO for Beginners', url: 'https://www.youtube.com/watch?v=MYE6T_gd7H0', type: 'youtube', provider: 'Ahrefs' },
        { title: 'Moz Beginner Guide to SEO', url: 'https://moz.com/beginners-guide-to-seo', type: 'docs', provider: 'Moz' },
      ],
    },
  },
};

// Fuzzy match a user's job role to one in the map
export function findBestRoleMatch(userRole) {
  if (!userRole) return null;
  const lower = userRole.toLowerCase().trim();

  // Direct match
  for (const key of Object.keys(roleSkillsMap)) {
    if (key.toLowerCase() === lower) return key;
  }

  // Partial/contains match
  for (const key of Object.keys(roleSkillsMap)) {
    if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) return key;
  }

  // Keyword-based match
  const keywordMap = {
    'dba': 'Oracle DBA',
    'database': 'Oracle DBA',
    'oracle': 'Oracle DBA',
    'production': 'Production Engineer',
    'sre': 'Production Engineer',
    'site reliability': 'Production Engineer',
    'frontend': 'Frontend Developer',
    'front-end': 'Frontend Developer',
    'front end': 'Frontend Developer',
    'react': 'Frontend Developer',
    'backend': 'Backend Developer',
    'back-end': 'Backend Developer',
    'back end': 'Backend Developer',
    'full stack': 'Full Stack Developer',
    'fullstack': 'Full Stack Developer',
    'full-stack': 'Full Stack Developer',
    'data analyst': 'Data Analyst',
    'data science': 'Data Scientist',
    'data scientist': 'Data Scientist',
    'machine learning': 'Machine Learning Engineer',
    'ml engineer': 'Machine Learning Engineer',
    'devops': 'DevOps Engineer',
    'cloud': 'Cloud Engineer',
    'project manager': 'Project Manager',
    'product manager': 'Product Manager',
    'ux': 'UX Designer',
    'ui': 'UX Designer',
    'designer': 'UX Designer',
    'security': 'Cybersecurity Analyst',
    'cyber': 'Cybersecurity Analyst',
    'business analyst': 'Business Analyst',
    'marketing': 'Marketing Manager',
    'software': 'Software Engineer',
    'developer': 'Software Engineer',
    'engineer': 'Software Engineer',
    'programmer': 'Software Engineer',
  };

  for (const [keyword, role] of Object.entries(keywordMap)) {
    if (lower.includes(keyword)) return role;
  }

  // Default fallback
  return 'Software Engineer';
}

// Get role data for a matched role
export function getRoleData(roleName) {
  return roleSkillsMap[roleName] || roleSkillsMap['Software Engineer'];
}

// Analyze skill gap between user skills and role requirements
export function analyzeSkillGap(userSkills = [], targetRoles = [], resumeJobTitle = '') {
  // Normalize user skills for comparison
  const normalizedUserSkills = userSkills.map((s) => s.toLowerCase().trim());

  // Get all target role data, merging multiple roles
  const allRequired = new Set();
  const allAdvanced = new Set();
  const allEmerging = new Set();
  const allCareerPaths = [];
  const allResources = {};

  const rolesToCheck = targetRoles.length > 0 ? targetRoles : [resumeJobTitle].filter(Boolean);

  if (rolesToCheck.length === 0) {
    rolesToCheck.push('Software Engineer');
  }

  const matchedRoles = [];

  for (const role of rolesToCheck) {
    const matchedName = findBestRoleMatch(role);
    if (matchedName && !matchedRoles.includes(matchedName)) {
      matchedRoles.push(matchedName);
      const data = getRoleData(matchedName);

      data.requiredSkills.forEach((s) => allRequired.add(s));
      data.advancedSkills.forEach((s) => allAdvanced.add(s));
      data.emergingSkills.forEach((s) => allEmerging.add(s));
      allCareerPaths.push({ role: matchedName, path: data.careerPath });

      // Merge resources
      for (const [skill, resources] of Object.entries(data.resources)) {
        if (!allResources[skill]) allResources[skill] = [];
        for (const r of resources) {
          if (!allResources[skill].some((existing) => existing.url === r.url)) {
            allResources[skill].push(r);
          }
        }
      }
    }
  }

  // Check which skills user already has
  const hasSkill = (skill) => {
    const lower = skill.toLowerCase();
    return normalizedUserSkills.some(
      (us) => us === lower || us.includes(lower) || lower.includes(us)
    );
  };

  // Categorize missing skills
  const highPriority = [...allRequired].filter((s) => !hasSkill(s));
  const goodToHave = [...allAdvanced].filter((s) => !hasSkill(s));
  const emergingTrends = [...allEmerging].filter((s) => !hasSkill(s));

  // Calculate coverage
  const totalRequired = allRequired.size;
  const coveredRequired = totalRequired - highPriority.length;
  const coveragePercent = totalRequired > 0 ? Math.round((coveredRequired / totalRequired) * 100) : 0;

  const totalAll = allRequired.size + allAdvanced.size + allEmerging.size;
  const coveredAll = totalAll - highPriority.length - goodToHave.length - emergingTrends.length;
  const overallCoverage = totalAll > 0 ? Math.round((coveredAll / totalAll) * 100) : 0;

  // Skills user already has (matched)
  const matchedSkills = [...allRequired, ...allAdvanced].filter((s) => hasSkill(s));

  return {
    matchedRoles,
    highPriority,
    goodToHave,
    emergingTrends,
    matchedSkills,
    coveragePercent,
    overallCoverage,
    careerPaths: allCareerPaths,
    resources: allResources,
    totalRequired,
    coveredRequired,
  };
}

export default roleSkillsMap;
