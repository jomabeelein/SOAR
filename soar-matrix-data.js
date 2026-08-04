// East Central MS S.O.A.R. Matrix Data (English & Spanish)
const SOAR_MATRIX = {
    en: {
        title: "East Central MS S.O.A.R. Matrix",
        subtitle: "S.O.A.R. in all locations",
        locations: ["Classroom", "Hallway", "Cafeteria", "Bathroom", "Office", "Stairwell", "Assemblies", "Technology"],
        pillars: [
            {
                code: "S",
                name: "S is for Show respect",
                shortName: "Show Respect",
                color: "#DC143C",
                items: {
                    Classroom: ["Use classroom materials correctly", "Remain on task and complete work", "Follow directions"],
                    Hallway: ["Go to your destination quickly and quietly", "Be on time", "Voice level 0 or 1"],
                    Cafeteria: ["Get utensils before sitting down", "Use appropriate voice levels"],
                    Bathroom: ["Throw trash away", "Flush toilet", "Wash hands"],
                    Office: ["Use an office pass when going and leaving the office"],
                    Stairwell: ["Use the right side when walking up and down stairwell", "Always use the handrail", "Voice level 0 or 1"],
                    Assemblies: ["Be a good listener", "Be on time"],
                    Technology: ["Remain on task when using technology", "Store headphones properly"]
                }
            },
            {
                code: "O",
                name: "O is for Own your learning and behavior",
                shortName: "Own Your Learning & Behavior",
                color: "#FFB703",
                items: {
                    Classroom: ["Be prepared for class", "Do your personal best", "Ask questions and seek help when needed"],
                    Hallway: ["Go directly to your destination", "Walk at all times", "Keep hands, feet, and objects to yourself"],
                    Cafeteria: ["Be polite, saying 'please' and 'thank you'", "Follow adult directions the first time"],
                    Bathroom: ["Only use bathroom when needed", "Give others privacy"],
                    Office: ["Be polite, saying 'please' and 'thank you'"],
                    Stairwell: ["Be aware of your surroundings", "Keep eyes forward at all times"],
                    Assemblies: ["Line up quickly", "Participate in the assembly"],
                    Technology: ["Be prepared to learn new technological activities/tasks", "Use technology for academic use only"]
                }
            },
            {
                code: "A",
                name: "A is for Act with Integrity",
                shortName: "Act with Integrity",
                color: "#2A9D8F",
                items: {
                    Classroom: ["Listen to and follow directions", "Help others", "Be kind to others", "Participate appropriately"],
                    Hallway: ["Keep hallways clean", "Always use a pass"],
                    Cafeteria: ["Clean up trash and area", "Use Voice Level 1 or 0"],
                    Bathroom: ["Return to class right away", "Use a bathroom pass"],
                    Office: ["Complete tasks or errands quickly and return to class"],
                    Stairwell: ["Keep stairwell clean", "Take the steps one at a time"],
                    Assemblies: ["Keep auditorium clean", "Be kind to others"],
                    Technology: ["Only use technology as directed by the teacher", "Return technology and charge after use"]
                }
            },
            {
                code: "R",
                name: "R is for Rise above conflict",
                shortName: "Rise Above Conflict",
                color: "#457B9D",
                items: {
                    Classroom: ["Use respectful language", "Accept consequences without argument", "Make positive choices"],
                    Hallway: ["Walk on the right side", "Do not swing bags or belongings", "Walk away from conflict"],
                    Cafeteria: ["Politely take turns", "Keep hands and feet to yourself"],
                    Bathroom: ["Be quick", "Be quiet", "Focus on your own business", "Seek adult help when needed"],
                    Office: ["Accept responsibility for your actions and words", "Wait patiently"],
                    Stairwell: ["Walk safely", "Give people space", "Keep hands and feet to yourself"],
                    Assemblies: ["Do not save seats", "Enter and exit quietly", "Listen and participate in the assembly"],
                    Technology: ["Keep hands on your own device", "Do not share log-in information", "Report inappropriate use"]
                }
            }
        ]
    },
    es: {
        title: "East Central MS - Matriz S.O.A.R.",
        subtitle: "S.O.A.R. en todos los lugares",
        locations: ["Salón de clases", "Pasillo", "Cafetería", "Baño", "Oficina", "Escaleras", "Asambleas", "Tecnología"],
        pillars: [
            {
                code: "S",
                name: "S = Mostrar respeto",
                shortName: "Mostrar Respeto",
                color: "#DC143C",
                items: {
                    "Salón de clases": ["Usar los materiales correctamente", "Mantenerse enfocado y completar el trabajo", "Aceptar consecuencias sin discutir"],
                    Pasillo: ["Ir a su destino rápidamente y en silencio", "Llegar a tiempo", "Nivel de voz 0 o 1"],
                    Cafetería: ["Recoger utensilios antes de sentarse", "Comer primero, luego socializar"],
                    Baño: ["Tirar la basura", "Bajar la palanca", "Lavarse las manos"],
                    Oficina: ["Usar pase para entrar y salir de la oficina"],
                    Escaleras: ["Usar lado derecho", "Usar pasamanos", "Nivel de voz 0 o 1"],
                    Asambleas: ["Escuchar atentamente", "Llegar a tiempo"],
                    Tecnología: ["Mantenerse enfocado usando tecnología", "Guardar audífonos correctamente"]
                }
            },
            {
                code: "O",
                name: "O = Asumir responsabilidad",
                shortName: "Asumir Responsabilidad",
                color: "#FFB703",
                items: {
                    "Salón de clases": ["Trabajar duro, incluso cuando es difícil", "Estar preparado", "Dar su mejor esfuerzo"],
                    Pasillo: ["Ir directamente al destino", "Caminar siempre en fila"],
                    Cafetería: ["Ser cortés (decir 'por favor' y 'gracias')"],
                    Baño: ["Usar el baño solo cuando sea necesario", "Respetar la privacidad de otros"],
                    Oficina: ["Ser cortés"],
                    Escaleras: ["Estar atento al entorno", "Mirar hacia adelante"],
                    Asambleas: ["Formarse rápidamente", "Participar"],
                    Tecnología: ["Estar preparado para aprender nuevas herramientas", "Usar tecnología solo para fines académicos"]
                }
            },
            {
                code: "A",
                name: "A = Actuar con integridad",
                shortName: "Actuar con Integridad",
                color: "#2A9D8F",
                items: {
                    "Salón de clases": ["Seguir instrucciones", "Ayudar a otros", "Ser amable"],
                    Pasillo: ["Mantener pasillos limpios", "Usar pase siempre"],
                    Cafetería: ["Limpiar su área", "Nivel de voz 0 o 1"],
                    Baño: ["Regresar rápido a clase", "Usar pase"],
                    Oficina: ["Completar tareas rápidamente y regresar"],
                    Escaleras: ["Mantener escaleras limpias", "Subir/bajar un escalón a la vez"],
                    Asambleas: ["Mantener limpio el auditorio", "Ser amable"],
                    Tecnología: ["Usar tecnología según instrucciones", "Devolver y cargar dispositivos"]
                }
            },
            {
                code: "R",
                name: "R = Superar conflictos",
                shortName: "Superar Conflictos",
                color: "#457B9D",
                items: {
                    "Salón de clases": ["Ignorar conductas inapropiadas", "Usar lenguaje respetuoso", "Seguir instrucciones"],
                    Pasillo: ["Caminar por la derecha", "No balancear mochilas", "Voz nivel 0 o 1"],
                    Cafetería: ["Hacer nuevos amigos", "Turnarse con respeto"],
                    Baño: ["Enfocarse en sí mismo", "Ser rápido y silencioso", "Turnarse"],
                    Oficina: ["Aceptar responsabilidad", "Esperar pacientemente"],
                    Escaleras: ["Caminar con seguridad", "No empujar", "Dar espacio"],
                    Asambleas: ["No apartar asientos", "Entrar/salir en silencio", "Escuchar y participar"],
                    Tecnología: ["Usar solo su dispositivo", "No compartir contraseñas", "Mantenerse enfocado", "Reportar uso inapropiado"]
                }
            }
        ]
    }
};

// Initial Pre-loaded Sample Data for Testing Moderation, Slides & Parent Letters
const INITIAL_NOMINATIONS = [
    {
        id: "nom-101",
        studentName: "Elena Rodriguez",
        grade: "7th Grade",
        nominatorName: "Mr. Davis (Math)",
        nominatorRole: "Teacher / Staff",
        pillar: "O",
        pillarName: "Own Your Learning & Behavior",
        location: "Classroom",
        reason: "Elena stayed during advisory to rework a challenging algebra section. Even when she found it difficult at first, she kept trying, asked thoughtful questions, and mastered the concepts.",
        alignmentScore: "High",
        status: "Approved",
        adminNote: "Excellent example of ownership & persistence.",
        date: "2026-08-01",
        language: "en"
    },
    {
        id: "nom-102",
        studentName: "Jayden Carter",
        grade: "6th Grade",
        nominatorName: "Coach Rivera",
        nominatorRole: "Teacher / Staff",
        pillar: "R",
        pillarName: "Rise Above Conflict",
        location: "Cafeteria",
        reason: "When a disagreement started at the lunch table over seating, Jayden stayed calm, invited a student who was sitting alone to join them, and helped de-escalate the tension gracefully.",
        alignmentScore: "High",
        status: "Approved",
        adminNote: "Outstanding leadership in cafeteria.",
        date: "2026-08-02",
        language: "en"
    },
    {
        id: "nom-103",
        studentName: "Sofia Gomez",
        grade: "8th Grade",
        nominatorName: "Sra. Hernandez",
        nominatorRole: "Teacher / Staff",
        pillar: "A",
        pillarName: "Act with Integrity",
        location: "Hallway",
        reason: "Sofia found a dropped wallet containing student IDs and money in the main corridor near locker 142. She immediately turned it into the main office without touching anything inside.",
        alignmentScore: "High",
        status: "Approved",
        adminNote: "Demonstrated true integrity.",
        date: "2026-08-02",
        language: "en"
    },
    {
        id: "nom-104",
        studentName: "Tyler Smith",
        grade: "7th Grade",
        nominatorName: "Lucas P. (Peer)",
        nominatorRole: "Student Peer",
        pillar: "S",
        pillarName: "Show Respect",
        location: "Technology",
        reason: "Tyler helped me fix my laptop charger cable when it got tangled and reminded our table to mute our sound during library work time.",
        alignmentScore: "High",
        status: "Approved",
        adminNote: "Approved peer nomination.",
        date: "2026-08-03",
        language: "en"
    },
    {
        id: "nom-105",
        studentName: "Brandon Vance",
        grade: "6th Grade",
        nominatorName: "Anonymous Student",
        nominatorRole: "Student Peer",
        pillar: "S",
        pillarName: "Show Respect",
        location: "Hallway",
        reason: "He is super cool and nice.",
        alignmentScore: "Low",
        status: "Pending",
        adminNote: "Flagged: Too short & unspecific. Needs Dean edit before approval.",
        date: "2026-08-03",
        language: "en"
    },
    {
        id: "nom-106",
        studentName: "Maya Lin",
        grade: "8th Grade",
        nominatorName: "Mrs. Patel (Science)",
        nominatorRole: "Teacher / Staff",
        pillar: "O",
        pillarName: "Own Your Learning & Behavior",
        location: "Classroom",
        reason: "Maya organized the lab equipment station after science experiment without being asked and helped two absent group members catch up on data analysis.",
        alignmentScore: "High",
        status: "Pending",
        adminNote: "",
        date: "2026-08-03",
        language: "en"
    }
];
