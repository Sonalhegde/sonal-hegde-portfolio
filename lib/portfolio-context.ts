export const PORTFOLIO_CONTEXT = `
Sonal Hegde is an Electronics & Communication Engineering undergraduate at NMAM Institute of Technology, expected to graduate in 2028. Sonal is based in Mangalore/Karkala, Karnataka, India.

Focus areas: embedded systems, IoT, cyber-physical systems, edge AI, computer vision, digital twins, firmware, TinyML, real-time systems, computer networks, model optimization, and rapid prototyping.

Career interests: internships and early-career opportunities in embedded engineering, edge AI, cyber-physical systems, IoT, and computer networks, plus technology consulting and product development roles that turn complex technical problems into robust products.

Experience:
- Project Intern, Applied Cyber-Physical Systems at the Center for System Design, National Institute of Technology Karnataka, Surathkal, on-site, June 2026 to August 2026. Work included a digital-twin smart transportation initiative, 10+ heterogeneous sensors, ESP32 nodes, a Raspberry Pi controller, CoAP, MQTT, and controller logic for reliability and predictive-maintenance readiness.
- Marine debris detection internship project at Sultan Qaboos University, Muscat, Oman. Built a YOLOv8 pipeline for drone imagery, curated and annotated a floating-debris dataset, exceeded 90% detection accuracy, optimized inference for NVIDIA Jetson Nano, and integrated a live web dashboard. The CV does not list dates for this work.

Projects: Digital Twin-Based Smart Transportation & Safety System; Real-Time Energy Profiling System for IoT Devices; Marine Debris Detection using YOLOv8; Smart Medication Dispenser; TruthSnap anti-phishing tool; Kuldio AI-powered ESG reporting platform; VU Meter custom PCB audio visualizer.

Technical stack: Python, C++, Embedded C, Java, JavaScript, MATLAB, Unix Shell; ESP32, STM32, Arduino, Raspberry Pi, FreeRTOS, UART/SPI/I2C/CAN, PCB design; MQTT, CoAP, REST, BLE, Wi-Fi, Zigbee, ESP-NOW, AWS IoT Core; PyTorch, Hugging Face Transformers, OpenCV, YOLOv8, NLP, Edge AI; Three.js, Anime.js, WebGL, Git/GitHub, Blender.

Certifications: Atlassian Certified Product Management Professional; McKinsey Forward Program; Network Security Fundamentals from Palo Alto Networks; Introduction to MCP from Anthropic; AI on Jetson Nano from NVIDIA; AWS IoT Devices; Networking Basics from Cisco; Data Science & Analytics from HP LIFE; Time Series Analysis from Infosys. The portfolio displays the user-approved year-only fallback: the four latest entries as 2026 and the remaining entries as 2025. Exact issue dates and credential links are not listed in the CV.

Contact: sonalhhegde@gmail.com. GitHub: https://github.com/sonalhegde. LinkedIn: https://linkedin.com/in/sonalhegde.
`.trim();

export function portfolioFallbackAnswer(question: string) {
  const query = question.toLowerCase();
  if (/contact|email|reach|hire/.test(query)) return "You can reach Sonal at sonalhhegde@gmail.com. The Contact section also includes mail, Gmail, GitHub, LinkedIn, and CV links.";
  if (/marine|yolo|debris|oman|jetson/.test(query)) return "Sonal built a YOLOv8 marine-debris detection pipeline during an internship project at Sultan Qaboos University in Oman. It used drone imagery, a custom annotated floating-debris dataset, exceeded 90% detection accuracy, was optimized for Jetson Nano, and fed a live web dashboard. The CV does not list the project dates.";
  if (/nitk|intern|experience|digital twin|transport/.test(query)) return "At NITK Surathkal’s Center for System Design (June–August 2026), Sonal worked on a digital-twin smart transportation initiative spanning 10+ heterogeneous sensors, ESP32 edge nodes, Raspberry Pi control, CoAP, MQTT, and reliability-oriented system integration.";
  if (/skill|stack|technology|language|firmware/.test(query)) return "Sonal’s stack spans Embedded C, C++, Python, ESP32, STM32, Raspberry Pi, FreeRTOS, hardware buses, MQTT/CoAP, PyTorch, OpenCV, YOLOv8, Edge AI, PCB design, and web visualization tools.";
  if (/education|college|degree|graduate/.test(query)) return "Sonal is pursuing a B.Tech in Electronics & Communication Engineering at NMAM Institute of Technology, affiliated to Nitte (Deemed to be University), with graduation expected in 2028.";
  if (/cert/.test(query)) return "The CV lists certifications from Atlassian, McKinsey.org, Palo Alto Networks, Anthropic, NVIDIA, AWS, Cisco, HP LIFE, and Infosys. The portfolio uses year-only placeholders approved by Sonal; exact issue dates and credential links are not present in the CV.";
  if (/project/.test(query)) return "Sonal’s seven highlighted builds span digital twins, IoT energy profiling, YOLOv8 marine-debris detection, medication automation, anti-phishing, ESG reporting, and custom PCB audio visualization. Ask about any one for details.";
  return "I can answer questions about Sonal’s experience, projects, skills, education, certifications, CV, or contact details. Try asking about the NITK work, marine-debris project, or embedded stack.";
}
