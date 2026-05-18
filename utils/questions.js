const quizQuestions = [
    {
        id: 1,
        question: "Which of the following best defines a computer?",
        options: ["A device for communication", "An electronic machine that processes data", "A manual tool", "A mechanical instrument"],
        correct: 1,
        explanation: "A computer is an electronic device that processes data according to instructions."
    },
    {
        id: 2,
        question: "Which component acts as the brain of the computer?",
        options: ["Hard Disk", "Monitor", "CPU", "Keyboard"],
        correct: 2,
        explanation: "The Central Processing Unit (CPU) executes instructions and processes data."
    },
    {
        id: 3,
        question: "Which of the following is a characteristic of computers?",
        options: ["Laziness", "Fatigue", "Accuracy", "Unreliability"],
        correct: 2,
        explanation: "Computers are known for their accuracy and precision in calculations."
    },
    {
        id: 4,
        question: "The term 'software' refers to:",
        options: ["The physical parts", "The programs that run the computer", "The memory chips", "The electrical power"],
        correct: 1,
        explanation: "Software consists of programs and instructions that tell hardware what to do."
    },
    {
        id: 5,
        question: "The process of solving a problem step by step in a clear manner is called:",
        options: ["Algorithm", "Program", "Debugging", "Flowchart"],
        correct: 0,
        explanation: "An algorithm is a step-by-step procedure for solving a problem."
    },
    {
        id: 6,
        question: "Artificial Intelligence refers to:",
        options: ["Human natural skills", "Simulation of human intelligence in machines", "Data storage", "Fast computing only"],
        correct: 1,
        explanation: "AI aims to create machines that can think and learn like humans."
    },
    {
        id: 7,
        question: "Which of the following is an example of AI application?",
        options: ["Face recognition", "File compression", "Disk formatting", "Typing assistant only"],
        correct: 0,
        explanation: "Face recognition uses machine learning algorithms to identify individuals."
    },
    {
        id: 8,
        question: "The Turing Test was proposed by:",
        options: ["Alan Turing", "John McCarthy", "Ada Lovelace", "Charles Babbage"],
        correct: 0,
        explanation: "Alan Turing proposed the Turing Test to measure machine intelligence."
    },
    {
        id: 9,
        question: "Which of the following is NOT a branch of AI?",
        options: ["Machine Learning", "Robotics", "Spreadsheets", "Natural Language Processing"],
        correct: 2,
        explanation: "Spreadsheets are business software, not a branch of AI."
    },
    {
        id: 10,
        question: "Narrow AI focuses on:",
        options: ["A single specific task", "General intelligence", "Natural intelligence", "Emotional learning"],
        correct: 0,
        explanation: "Narrow AI is designed for specific tasks like facial recognition or chess."
    },
    {
        id: 11,
        question: "Cybersecurity mainly involves:",
        options: ["Protecting systems from digital threats", "Improving network speed", "Programming software", "Installing applications"],
        correct: 0,
        explanation: "Cybersecurity protects computers, networks, and data from cyber threats."
    },
    {
        id: 12,
        question: "Which of the following is an example of social engineering?",
        options: ["Phishing", "Software update", "Data backup", "Firewall configuration"],
        correct: 0,
        explanation: "Phishing tricks users into revealing sensitive information."
    },
    {
        id: 13,
        question: "The process of converting readable data into an unreadable form is called:",
        options: ["Encryption", "Decryption", "Formatting", "Encoding"],
        correct: 0,
        explanation: "Encryption secures data by converting it into ciphertext."
    },
    {
        id: 14,
        question: "A strong password should include:",
        options: ["Only letters", "Numbers, symbols, and mixed case letters", "One single word", "User's birthdate"],
        correct: 1,
        explanation: "Strong passwords use a mix of character types for better security."
    },
    {
        id: 15,
        question: "VPN stands for:",
        options: ["Virtual Private Network", "Verified Protocol Node", "Virtual Program Number", "Variable Point Name"],
        correct: 0,
        explanation: "VPN creates a secure, encrypted connection over the internet."
    },
    {
        id: 16,
        question: "The process of writing and testing programs is called:",
        options: ["Debugging", "Coding", "Program Development Cycle", "Execution"],
        correct: 2,
        explanation: "The Program Development Cycle includes planning, coding, testing, and maintenance."
    },
    {
        id: 17,
        question: "Which of the following translates source code into machine language?",
        options: ["Debugger", "Compiler", "Editor", "Flowchart"],
        correct: 1,
        explanation: "A compiler translates entire source code into machine language at once."
    },
    {
        id: 18,
        question: "Logical errors in a program are fixed through:",
        options: ["Compilation", "Debugging", "Execution", "Input"],
        correct: 1,
        explanation: "Debugging is the process of finding and fixing logical errors."
    },
    {
        id: 19,
        question: "A graphical tool that represents program logic is called:",
        options: ["Flowchart", "Pseudocode", "Interpreter", "Algorithm"],
        correct: 0,
        explanation: "Flowcharts use symbols to visually represent program flow."
    },
    {
        id: 20,
        question: "A set of instructions that performs a specific task is known as:",
        options: ["Hardware", "Software", "Program", "File"],
        correct: 2,
        explanation: "A program is a collection of instructions that performs a specific task."
    },
    {
        id: 21,
        question: "The Internet is:",
        options: ["A local area network", "A global system of interconnected networks", "A standalone computer", "A server program"],
        correct: 1,
        explanation: "The Internet connects millions of networks worldwide."
    },
    {
        id: 22,
        question: "The World Wide Web is:",
        options: ["The same as the Internet", "A service on the Internet", "An email client", "A search engine"],
        correct: 1,
        explanation: "WWW is a service that runs on the Internet using HTTP protocol."
    },
    {
        id: 23,
        question: "Which protocol is used to transfer web pages?",
        options: ["FTP", "HTTP", "SMTP", "DNS"],
        correct: 1,
        explanation: "HTTP (Hypertext Transfer Protocol) transfers web pages."
    },
    {
        id: 24,
        question: "A web browser is used to:",
        options: ["Edit code", "Access and view websites", "Manage emails", "Run system updates"],
        correct: 1,
        explanation: "Browsers like Chrome and Firefox display web content."
    },
    {
        id: 25,
        question: "The address of a web page is called:",
        options: ["URL", "IP", "DNS", "Link"],
        correct: 0,
        explanation: "URL (Uniform Resource Locator) is the web address."
    },
    {
        id: 26,
        question: "A spreadsheet organizes data into:",
        options: ["Pages", "Rows and Columns", "Lists", "Paragraphs"],
        correct: 1,
        explanation: "Spreadsheets use a grid of rows and columns."
    },
    {
        id: 27,
        question: "The intersection of a row and a column is known as:",
        options: ["Table", "Cell", "Field", "Entry"],
        correct: 1,
        explanation: "A cell is the basic unit in a spreadsheet."
    },
    {
        id: 28,
        question: "Which of these functions calculates the total of selected numbers?",
        options: ["MAX()", "AVERAGE()", "SUM()", "COUNT()"],
        correct: 2,
        explanation: "SUM() adds all numbers in a range."
    },
    {
        id: 29,
        question: "The part of Excel that shows the formula or data being edited is called:",
        options: ["Status Bar", "Formula Bar", "Title Bar", "Name Box"],
        correct: 1,
        explanation: "The Formula Bar displays and edits cell contents."
    },
    {
        id: 30,
        question: "Which of these charts is used to show proportions?",
        options: ["Line Chart", "Bar Chart", "Pie Chart", "Column Chart"],
        correct: 2,
        explanation: "Pie charts show parts of a whole as percentages."
    },
    {
        id: 31,
        question: "Software refers to:",
        options: ["Physical devices", "Instructions that tell a computer what to do", "Input data", "Hardware components"],
        correct: 1,
        explanation: "Software provides instructions for hardware to execute."
    },
    {
        id: 32,
        question: "Which of the following is an example of system software?",
        options: ["Microsoft Excel", "Operating System", "CorelDraw", "Word Processor"],
        correct: 1,
        explanation: "Operating systems like Windows manage computer resources."
    },
    {
        id: 33,
        question: "An example of application software is:",
        options: ["BIOS", "MS Word", "Compiler", "Utility"],
        correct: 1,
        explanation: "MS Word is an application for word processing."
    },
    {
        id: 34,
        question: "Software used to write and test other software is known as:",
        options: ["Programming Software", "System Software", "Database Software", "Application Software"],
        correct: 0,
        explanation: "IDEs and compilers are programming software tools."
    },
    {
        id: 35,
        question: "A spreadsheet package is used for:",
        options: ["Graphics design", "Numerical calculations", "Text formatting", "Audio recording"],
        correct: 1,
        explanation: "Spreadsheets excel at calculations and data analysis."
    },
    {
        id: 36,
        question: "CorelDraw is used mainly for:",
        options: ["Video editing", "Vector graphics design", "Audio mixing", "Text processing"],
        correct: 1,
        explanation: "CorelDraw creates vector-based illustrations and designs."
    },
    {
        id: 37,
        question: "In CorelDraw, the workspace refers to:",
        options: ["Toolbar", "Drawing area", "Status bar", "Menu panel"],
        correct: 1,
        explanation: "The workspace is the main drawing area in CorelDraw."
    },
    {
        id: 38,
        question: "The Docker provides access to:",
        options: ["Hardware settings", "Tool-specific commands", "File saving options", "Animation controls"],
        correct: 1,
        explanation: "Docker windows provide access to tool-specific commands."
    },
    {
        id: 39,
        question: "The Colour Palette allows the user to:",
        options: ["Choose and apply colors", "Adjust contrast", "Format text", "Save templates"],
        correct: 0,
        explanation: "The Color Palette provides quick color selection."
    },
    {
        id: 40,
        question: "CorelDraw files are typically saved with the extension:",
        options: [".CDR", ".DOCX", ".XLSX", ".PDF"],
        correct: 0,
        explanation: ".CDR is CorelDraw's native file format."
    },
    {
        id: 41,
        question: "PowerPoint is mainly used for:",
        options: ["Data analysis", "Creating slide presentations", "Database storage", "Text editing"],
        correct: 1,
        explanation: "PowerPoint creates professional slide presentations."
    },
    {
        id: 42,
        question: "Transitions in PowerPoint refer to:",
        options: ["Text formatting", "Animations between slides", "Slide background", "Music effects"],
        correct: 1,
        explanation: "Transitions are effects when moving between slides."
    },
    {
        id: 43,
        question: "Animations in PowerPoint are applied to:",
        options: ["Text or objects", "The entire presentation", "Themes", "Layouts only"],
        correct: 0,
        explanation: "Animations can be applied to individual elements on slides."
    },
    {
        id: 44,
        question: "The default file extension for PowerPoint presentations is:",
        options: [".PPTX", ".DOCX", ".XLSX", ".PDF"],
        correct: 0,
        explanation: ".PPTX is the default PowerPoint file format."
    },
    {
        id: 45,
        question: "The Slide Master view allows users to:",
        options: ["Apply consistent design to all slides", "Add transitions only", "Edit single slides", "Change animations"],
        correct: 0,
        explanation: "Slide Master controls global design across all slides."
    },
    {
        id: 46,
        question: "Microsoft Word is best described as:",
        options: ["Spreadsheet Software", "Word Processing Software", "Graphic Software", "Operating System"],
        correct: 1,
        explanation: "Word is a word processor for creating documents."
    },
    {
        id: 47,
        question: "The 'Insert' tab in Word is used to:",
        options: ["Add text only", "Insert tables, pictures, and objects", "Edit the page layout", "Change the view mode"],
        correct: 1,
        explanation: "The Insert tab adds various elements to documents."
    },
    {
        id: 48,
        question: "Which feature automatically detects spelling mistakes?",
        options: ["Smart Lookup", "Spell Check", "AutoSave", "AutoRecover"],
        correct: 1,
        explanation: "Spell Check underlines misspelled words in real-time."
    },
    {
        id: 49,
        question: "The file extension for Word 2007 and above is:",
        options: [".DOC", ".DOCX", ".TXT", ".RTF"],
        correct: 1,
        explanation: ".DOCX is the XML-based Word format since 2007."
    },
    {
        id: 50,
        question: "The 'References' tab provides tools to:",
        options: ["Insert citations and bibliographies", "Review grammar", "Insert shapes", "Manage mail merge"],
        correct: 0,
        explanation: "The References tab manages citations, footnotes, and bibliographies."
    }
];

module.exports = { quizQuestions };
