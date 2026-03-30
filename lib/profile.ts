import type { ProfileResume } from "@/types/content";
import { siteConfig } from "@/lib/site";

export const profileByLocale: Record<"zh" | "en", ProfileResume> = {
  zh: {
    bio: "北京航空航天大学电子信息硕士在读，聚焦强化学习、多智能体协同控制与无人系统任务规划。具备算法研究、系统建模与工程实现协同能力，关注 AI Agent 在复杂任务场景中的落地价值。",
    location: "北京",
    targetRole: "AI Agent 算法工程师 / 强化学习算法工程师",
    education: [
      {
        title: "北京航空航天大学（985）",
        subtitle: "自动化科学与电气工程学院 · 电子信息（硕士）",
        period: "2024.09 - 至今",
        bullets: [
          "导师：周锐（教授、博导），飞行器控制一体化技术国防科技重点实验室。",
          "研究方向：机器学习、强化学习、多智能体控制、无人自主控制。",
          "学生工作：北航校研会副主席、自动化学院研会主席。",
        ],
      },
      {
        title: "北京林业大学（211）",
        subtitle: "自动化学院 · 自动化（人工智能）",
        period: "2020.09 - 2024.06",
        bullets: [
          "主要荣誉：国家奖学金、北京市优秀毕业生、宝钢奖学金、一等学业奖学金。",
        ],
      },
    ],
    researchProjects: [
      {
        title: "大规模无人集群任务筹划与编队维持技术",
        subtitle: "航天创新研究院 · 技术负责人",
        period: "2024.09 - 2024.12",
        bullets: [
          "职责：负责目标分配、队形形成与重构的核心算法设计。",
          "方法：设计位置动态自适应分配、三维编队控制与运动控制算法。",
          "结果：实现大规模无人集群快速集结、编队形成与灵活队形调整。",
        ],
      },
      {
        title: "无人机集群任务规划",
        subtitle: "航天二院 · 技术负责人",
        period: "2024.05 - 至今",
        bullets: [
          "职责：负责集群集结方案、聚类编组策略与防撞方案设计。",
          "方法：基于诱导航线跟踪控制实现编队飞行，并结合重构与避障算法。",
          "结果：形成可支撑实时任务规划的集群协同控制方案。",
        ],
      },
      {
        title: "数据驱动的制导智能方法研究",
        subtitle: "中国航天一院 · 技术负责人",
        period: "2024.10 - 2024.12",
        bullets: [
          "职责：构建导弹弹道与可达区快速计算模型。",
          "方法：采用并行数据生成与清洗流程，结合多类神经网络建模。",
          "结果：可达区平均误差控制在 0.5% 以内。",
        ],
      },
      {
        title: "基于大语言模型和强化学习的多机协同任务规划",
        subtitle: "硕士毕业设计",
        period: "2025.11 - 至今",
        bullets: [
          "职责：研究动态与静态场景下的协同决策与资源调度算法。",
          "方法：提出一体式耦合优化与分层式解耦规划两类模型。",
          "结果：在复杂约束场景中兼顾全局优化效果与实时计算能力。",
        ],
      },
    ],
    experience: [
      {
        title: "小米",
        subtitle: "AI Agent 算法工程师（寒假实习）",
        period: "2026.01 - 2026.03",
        bullets: [
          "职责：参与游戏场景 AI Agent 能力建设与应用验证。",
          "方法：基于 MIMO 基座模型优化上下文建模、记忆机制与多轮决策链路。",
          "结果：提升玩家连续行为模拟能力，并为终端策略优化提供技术支撑。",
        ],
      },
      {
        title: "字节跳动（电商）",
        subtitle: "多模态大模型应用岗（暑期实习）",
        period: "2025.08 - 2025.09",
        bullets: [
          "职责：参与抖音直播场景多模态大模型研究与应用探索。",
          "方法：主导构建面向下一代交互体验的大规模训练数据集。",
          "结果：验证了多模态内容理解在实时互动场景中的技术可行性。",
        ],
      },
      {
        title: "飞书",
        subtitle: "CV 开发岗（校企合作）",
        period: "2024.01 - 2024.03",
        bullets: [
          "职责：参与图像内容理解与结构化数据处理算法迭代。",
          "方法：搭建“数据清洗-模型训练-效果评估”自动化链路。",
          "结果：提升数据质量与模型迭代效率，增强产品化落地能力。",
        ],
      },
      {
        title: "北航校研会/院研会",
        subtitle: "副主席 / 主席",
        period: "2025.07 - 至今",
        bullets: [
          "职责：统筹大型活动与校企合作项目，推进学生组织协同运营。",
          "结果：与字节、腾讯、滴滴等企业开展合作，累计争取赞助约 7 万元。",
        ],
      },
    ],
    publications: [
      {
        title: "Context-Aware Relational Learning for Cooperative UAV Formation",
        subtitle: "Journal of Beijing Institute of Technology（EI）",
        period: "第一作者",
        bullets: [
          "提出 CORAL 多智能体深度强化学习框架，融合情境感知与关系学习模块。",
          "在奖励稀疏场景下提升协同探索效率与队友意图建模能力。",
        ],
      },
      {
        title: "一种基于双层深度强化学习的多任务无人机协同决策与规划调度方法",
        subtitle: "信息与控制（EI、中文核心）",
        period: "第一作者",
        bullets: [
          "提出 DAP-DRL 双层解耦框架，分别优化任务分配与路径规划。",
          "设计三阶段协同训练策略，实现双层模型稳定耦合优化。",
        ],
      },
    ],
    competitions: [
      {
        title: "美国大学生数学建模竞赛",
        subtitle: "特等奖提名（Finalist） · 队长",
        period: "2023.02",
        bullets: [],
      },
      {
        title: "全国大学生数学建模竞赛",
        subtitle: "北京赛区二等奖 · 队员",
        period: "2022.10",
        bullets: [],
      },
      {
        title: "第十六届全国大学生智能汽车竞赛",
        subtitle: "华北赛区二等奖 · 队长",
        period: "2022.07",
        bullets: [],
      },
      {
        title: "森林火灾烟雾图像检测系统",
        subtitle: "北京挑战杯一等奖 · 队长",
        period: "2022.10 - 2023.05",
        bullets: [],
      },
    ],
    skills: [
      "C++",
      "Python",
      "MATLAB",
      "PyTorch",
      "ROS",
      "Reinforcement Learning",
      "Machine Learning",
      "Multi-Agent Systems",
      "Path Planning",
      "AI Agent",
    ],
    contact: {
      email: siteConfig.email,
      github: siteConfig.github,
      linkedin: siteConfig.linkedin,
    },
  },
  en: {
    bio: "Master's student in Electronic Information at Beihang University, focusing on reinforcement learning, multi-agent collaboration, and autonomous mission planning. Experienced in both algorithm research and engineering delivery for complex decision-making scenarios.",
    location: "Beijing, China",
    targetRole: "AI Agent Algorithm Engineer / Reinforcement Learning Engineer",
    education: [
      {
        title: "Beihang University (985)",
        subtitle: "School of Automation Science and Electrical Engineering · M.Eng. in Electronic Information",
        period: "Sep 2024 - Present",
        bullets: [
          "Advisor: Prof. Rui Zhou, National Key Defense Laboratory of Aircraft Control Integration.",
          "Research focus: machine learning, reinforcement learning, multi-agent control, and autonomous systems.",
          "Leadership: Vice Chair of Graduate Student Union (University), Chair at School level.",
        ],
      },
      {
        title: "Beijing Forestry University (211)",
        subtitle: "School of Automation · B.Eng. in Automation (AI)",
        period: "Sep 2020 - Jun 2024",
        bullets: [
          "Honors: National Scholarship, Beijing Outstanding Graduate, Baosteel Scholarship, First-Class Academic Scholarship.",
        ],
      },
    ],
    researchProjects: [
      {
        title: "Large-Scale UAV Swarm Task Planning and Formation Maintenance",
        subtitle: "Aerospace Innovation Institute · Technical Lead",
        period: "Sep 2024 - Dec 2024",
        bullets: [
          "Responsibility: led core algorithm design for target assignment and formation maintenance.",
          "Method: developed dynamic assignment, 3D formation control, and formation reconfiguration algorithms.",
          "Result: enabled fast rallying, stable formation, and flexible reconfiguration for large swarms.",
        ],
      },
      {
        title: "UAV Swarm Mission Planning",
        subtitle: "China Aerospace Science & Industry Corp. Second Academy · Technical Lead",
        period: "May 2024 - Present",
        bullets: [
          "Responsibility: designed clustering, rally strategy, and anti-collision mechanisms.",
          "Method: combined guidance-line tracking with formation restructuring and obstacle avoidance.",
          "Result: delivered a real-time oriented collaborative planning solution for UAV swarms.",
        ],
      },
      {
        title: "Data-Driven Intelligent Guidance Methods",
        subtitle: "China Aerospace Science and Technology Corp. First Academy · Technical Lead",
        period: "Oct 2024 - Dec 2024",
        bullets: [
          "Responsibility: built fast prediction models for trajectory and missile reachability.",
          "Method: parallel data generation and cleaning pipeline with multiple neural architectures.",
          "Result: kept average reachability error within 0.5%.",
        ],
      },
      {
        title: "LLM + Reinforcement Learning for Multi-UAV Collaborative Planning",
        subtitle: "Master's Thesis",
        period: "Nov 2025 - Present",
        bullets: [
          "Responsibility: studied collaborative decision-making and resource scheduling for dynamic/static scenarios.",
          "Method: proposed both tightly-coupled optimization and hierarchical decoupled planning models.",
          "Result: balanced global optimization quality and real-time constraints under complex conditions.",
        ],
      },
    ],
    experience: [
      {
        title: "Xiaomi",
        subtitle: "AI Agent Algorithm Engineer Intern",
        period: "Jan 2026 - Mar 2026",
        bullets: [
          "Responsibility: researched and validated game-scene AI Agent capabilities.",
          "Method: optimized context modeling, memory mechanisms, and multi-turn decision chains on MIMO base models.",
          "Result: improved player behavior simulation and informed device strategy optimization.",
        ],
      },
      {
        title: "ByteDance E-commerce",
        subtitle: "Multimodal LLM Application Intern",
        period: "Aug 2025 - Sep 2025",
        bullets: [
          "Responsibility: explored multimodal LLM applications in Douyin live-streaming scenarios.",
          "Method: led large-scale dataset construction for next-generation interactive experiences.",
          "Result: validated technical feasibility of multimodal understanding in real-time interaction workflows.",
        ],
      },
      {
        title: "Feishu",
        subtitle: "Computer Vision Developer (University-Industry Program)",
        period: "Jan 2024 - Mar 2024",
        bullets: [
          "Responsibility: participated in CV algorithm iteration for visual understanding and structured extraction.",
          "Method: built an automated loop for data cleaning, model training, and evaluation.",
          "Result: improved data quality and model iteration efficiency with stronger product alignment.",
        ],
      },
      {
        title: "Graduate Student Union at Beihang",
        subtitle: "Vice Chair / School-level Chair",
        period: "Jul 2025 - Present",
        bullets: [
          "Responsibility: coordinated large-scale events and university-industry collaboration initiatives.",
          "Result: partnered with major tech firms and secured approximately CNY 70,000 in sponsorships.",
        ],
      },
    ],
    publications: [
      {
        title: "Context-Aware Relational Learning for Cooperative UAV Formation",
        subtitle: "Journal of Beijing Institute of Technology (EI)",
        period: "First Author",
        bullets: [
          "Proposed CORAL, a multi-agent deep RL framework with contextual awareness and relational learning.",
          "Improved cooperative exploration efficiency and teammate-intent inference under sparse rewards.",
        ],
      },
      {
        title: "A Dual-Layer Deep RL Method for Multi-UAV Collaborative Decision and Planning",
        subtitle: "Information and Control (EI, Chinese Core Journal)",
        period: "First Author",
        bullets: [
          "Proposed DAP-DRL, a dual-layer decoupled framework for task assignment and path planning.",
          "Designed a three-stage collaborative training strategy for stable coupled optimization.",
        ],
      },
    ],
    competitions: [
      {
        title: "MCM/ICM",
        subtitle: "Finalist · Team Leader",
        period: "Feb 2023",
        bullets: [],
      },
      {
        title: "China Undergraduate Mathematical Contest in Modeling",
        subtitle: "Second Prize (Beijing Region) · Team Member",
        period: "Oct 2022",
        bullets: [],
      },
      {
        title: "National Intelligent Vehicle Competition (16th)",
        subtitle: "Second Prize (North China) · Team Leader",
        period: "Jul 2022",
        bullets: [],
      },
      {
        title: "Forest Fire Smoke Detection System",
        subtitle: "First Prize, Beijing Challenge Cup · Team Leader",
        period: "Oct 2022 - May 2023",
        bullets: [],
      },
    ],
    skills: [
      "C++",
      "Python",
      "MATLAB",
      "PyTorch",
      "ROS",
      "Reinforcement Learning",
      "Machine Learning",
      "Multi-Agent Systems",
      "Path Planning",
      "AI Agent",
    ],
    contact: {
      email: siteConfig.email,
      github: siteConfig.github,
      linkedin: siteConfig.linkedin,
    },
  },
};
