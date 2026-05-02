require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');
const Course = require('./models/Course');
const Question = require('./models/Question');

// ── ORIGINAL QUESTION DATA (preserved from existing frontend) ────────
const coursesData = {
  ECO101: {
    title: "Introduction to Economics",
    code: "ECO 101",
    department: "Economics",
    units: 3,
    duration: 30,
    status: "active",
    questionsData: [
      { q: "Economics is best defined as the study of:", options: ["How to make money in the stock market", "How society manages its scarce resources", "How to run a business profitably", "How government controls inflation"], a: 1 },
      { q: "The concept of 'Opportunity Cost' refers to:", options: ["The monetary price of a good", "The value of the next best alternative forgone", "The cost of producing one more unit", "The total cost of production"], a: 1 },
      { q: "Which of the following is a Microeconomic topic?", options: ["Inflation rate in Nigeria", "Unemployment levels in Osun State", "The price determination of Yam in Iragbiji", "Government budget deficit"], a: 2 },
      { q: "The 'Law of Demand' states that, ceteris paribus:", options: ["Price and Quantity Demanded are directly related", "Price and Quantity Demanded are inversely related", "Income and Demand are inversely related", "Supply creates its own demand"], a: 1 },
      { q: "A shift in the Demand curve is caused by:", options: ["Change in the price of the good itself", "Change in consumer income", "Change in production technology", "Change in the cost of raw materials"], a: 1 },
      { q: "If two goods are substitutes, an increase in the price of one will:", options: ["Decrease the demand for the other", "Increase the demand for the other", "Have no effect on the other", "Shift the supply curve of the other"], a: 1 },
      { q: "Price Elasticity of Demand measures:", options: ["Responsiveness of quantity demanded to change in price", "Responsiveness of supply to change in price", "Change in income due to price change", "Total revenue generated"], a: 0 },
      { q: "If PED > 1, demand is said to be:", options: ["Inelastic", "Unitary elastic", "Elastic", "Perfectly inelastic"], a: 2 },
      { q: "The 'Law of Diminishing Marginal Utility' explains why:", options: ["Supply curves slope upward", "Demand curves slope downward", "Costs increase with output", "Profits maximize at MR=MC"], a: 1 },
      { q: "Market Equilibrium occurs where:", options: ["Quantity Supplied exceeds Quantity Demanded", "Quantity Demanded exceeds Quantity Supplied", "Quantity Supplied equals Quantity Demanded", "Price is at its maximum"], a: 2 },
      { q: "A Price Floor set above equilibrium results in:", options: ["Shortage", "Surplus", "Equilibrium", "Black market only"], a: 1 },
      { q: "Which of the following is NOT a factor of production?", options: ["Land", "Labor", "Money", "Capital"], a: 2 },
      { q: "GDP stands for:", options: ["Gross Domestic Product", "General Domestic Price", "Gross Demand Power", "Global Development Plan"], a: 0 },
      { q: "Inflation is defined as:", options: ["A decrease in general price levels", "An increase in general price levels", "An increase in unemployment", "A decrease in money supply"], a: 1 },
      { q: "Frictional Unemployment is caused by:", options: ["Recession in the economy", "Time taken to match workers with jobs", "Seasonal changes in weather", "Automation of industries"], a: 1 },
      { q: "Fiscal Policy involves the use of:", options: ["Money supply and interest rates", "Government spending and taxation", "Exchange rates and tariffs", "Import quotas"], a: 1 },
      { q: "Monetary Policy in Nigeria is conducted by:", options: ["The Ministry of Finance", "The Central Bank of Nigeria", "The National Assembly", "The Commercial Banks"], a: 1 },
      { q: "Comparative Advantage suggests countries should specialize in goods where they have:", options: ["Absolute advantage", "Lower opportunity cost", "Higher labor costs", "More natural resources"], a: 1 },
      { q: "A Public Good is characterized by being:", options: ["Excludable and Rivalrous", "Non-excludable and Non-rivalrous", "Excludable and Non-rivalrous", "Non-excludable and Rivalrous"], a: 1 },
      { q: "The 'Free Rider Problem' is associated with:", options: ["Private Goods", "Public Goods", "Club Goods", "Common Resources"], a: 1 },
      { q: "Marginal Cost (MC) is the change in Total Cost resulting from:", options: ["Producing one additional unit", "Changing fixed costs", "Changing variable costs only", "Selling one additional unit"], a: 0 },
      { q: "In Perfect Competition, firms are:", options: ["Price Makers", "Price Takers", "Monopolists", "Oligopolists"], a: 1 },
      { q: "A Monopoly exists when there is:", options: ["Many sellers", "Few sellers", "One seller", "Differentiated products"], a: 2 },
      { q: "Profit Maximization occurs where:", options: ["Total Revenue is highest", "Marginal Revenue equals Marginal Cost", "Average Cost is lowest", "Price equals Average Cost"], a: 1 },
      { q: "Normal Profit occurs when:", options: ["TR > TC", "TR < TC", "TR = TC (including opportunity cost)", "MR > MC"], a: 2 },
      { q: "Economies of Scale refer to:", options: ["Increasing costs as output increases", "Decreasing average costs as output increases", "Constant returns to scale", "Decreasing output as input increases"], a: 1 },
      { q: "GNP differs from GDP by including:", options: ["Net foreign factor income", "Depreciation", "Indirect taxes", "Subsidies"], a: 0 },
      { q: "Real GDP is adjusted for:", options: ["Population growth", "Inflation/Price changes", "Unemployment", "Exchange rates"], a: 1 },
      { q: "The Consumer Price Index (CPI) measures:", options: ["Production levels", "Changes in the cost of a basket of goods", "Stock market performance", "Interest rate changes"], a: 1 },
      { q: "Structural Unemployment is caused by:", options: ["Mismatch of skills and job requirements", "Business cycle fluctuations", "Weather conditions", "Temporary layoffs"], a: 0 },
      { q: "Which of the following is a Leakage in the Circular Flow?", options: ["Investment", "Government Spending", "Savings", "Exports"], a: 2 },
      { q: "The Multiplier Effect implies that an initial injection leads to:", options: ["A smaller final increase in income", "An equal final increase in income", "A larger final increase in income", "No change in income"], a: 2 },
      { q: "Balance of Payments records:", options: ["Only trade in goods", "All economic transactions with the rest of the world", "Only government debt", "Only private investments"], a: 1 },
      { q: "Devaluation of currency makes exports:", options: ["More expensive", "Cheaper", "Unaffected", "Impossible"], a: 1 },
      { q: "Progressive Tax means:", options: ["Everyone pays the same rate", "Higher income earners pay a higher percentage", "Lower income earners pay more", "Tax on luxury goods only"], a: 1 },
      { q: "The primary function of Commercial Banks is to:", options: ["Print money", "Accept deposits and grant loans", "Conduct Monetary Policy", "Collect taxes"], a: 1 },
      { q: "Hyperinflation is characterized by:", options: ["Very low inflation", "Extremely high and accelerating inflation", "Deflation", "Stable prices"], a: 1 },
      { q: "Merit Goods are often under-consumed because:", options: ["They are too expensive", "Consumers underestimate their benefits", "They are illegal", "They are public goods"], a: 1 },
      { q: "External Costs are also known as:", options: ["Private Costs", "Negative Externalities", "Fixed Costs", "Sunk Costs"], a: 1 },
      { q: "The Production Possibility Frontier (PPF) illustrates:", options: ["Infinite resources", "Scarcity and Choice", "Perfect competition", "Monopoly power"], a: 1 }
    ]
  },
  ACC101: {
    title: "Introduction to Accounting",
    code: "ACC 101",
    department: "Accounting",
    units: 3,
    duration: 90,
    status: "pending",
    questionsData: [
      { q: "Accounting is best described as:", options: ["The process of recording financial transactions", "The art of making money", "The study of economics", "The management of human resources"], a: 0 },
      { q: "The basic accounting equation is:", options: ["Assets = Liabilities + Equity", "Revenue = Expenses + Profit", "Assets + Liabilities = Equity", "Profit = Revenue - Expenses"], a: 0 },
      { q: "Which of the following is a current asset?", options: ["Building", "Machinery", "Cash", "Land"], a: 2 },
      { q: "The double-entry system means:", options: ["Every transaction affects two accounts", "Two people must approve each entry", "Entries are made twice for accuracy", "Both debit and credit sides must balance"], a: 3 },
      { q: "A trial balance is prepared to:", options: ["Calculate profit", "Check arithmetic accuracy", "Prepare financial statements", "All of the above"], a: 1 },
      { q: "Depreciation is charged on:", options: ["Current assets", "Fixed assets", "All assets", "Liabilities"], a: 1 },
      { q: "The going concern concept assumes:", options: ["The business will close soon", "The business will continue indefinitely", "Assets are valued at market price", "Profits are distributed annually"], a: 1 },
      { q: "Which statement shows financial position?", options: ["Income Statement", "Cash Flow Statement", "Balance Sheet", "Statement of Changes in Equity"], a: 2 },
      { q: "Accrual accounting recognizes revenue when:", options: ["Cash is received", "Goods are delivered or services performed", "Invoice is sent", "Customer places order"], a: 1 },
      { q: "The matching principle requires:", options: ["Expenses matched with related revenues", "Assets matched with liabilities", "Debits matched with credits", "Cash inflows matched with outflows"], a: 0 },
      { q: "Which is NOT a financial statement?", options: ["Balance Sheet", "Income Statement", "Trial Balance", "Cash Flow Statement"], a: 2 },
      { q: "Working capital is calculated as:", options: ["Current Assets - Current Liabilities", "Total Assets - Total Liabilities", "Fixed Assets - Long-term Liabilities", "Revenue - Expenses"], a: 0 },
      { q: "A journal entry includes:", options: ["Date, accounts, debit, credit, narration", "Only debit and credit amounts", "Only account names", "Only the date"], a: 0 },
      { q: "The ledger is also known as:", options: ["Book of original entry", "Book of final entry", "Book of accounts", "Book of transactions"], a: 1 },
      { q: "Bad debts are:", options: ["Amounts owed that cannot be collected", "Debts paid late", "Interest on loans", "Discounts allowed"], a: 0 },
      { q: "Prepaid expenses are:", options: ["Expenses paid in advance", "Expenses owed but not paid", "Expenses already incurred", "Expenses not yet due"], a: 0 },
      { q: "Accrued income is:", options: ["Income received in advance", "Income earned but not yet received", "Income not yet earned", "Income already spent"], a: 1 },
      { q: "The purpose of a bank reconciliation is to:", options: ["Match cash book with bank statement", "Calculate interest", "Prepare tax returns", "Audit financial statements"], a: 0 },
      { q: "Capital expenditure is spent on:", options: ["Day-to-day operations", "Acquiring or improving fixed assets", "Paying salaries", "Purchasing inventory"], a: 1 },
      { q: "Revenue expenditure benefits:", options: ["More than one accounting period", "Only the current period", "Future periods only", "No specific period"], a: 1 },
      { q: "Which is a liability?", options: ["Cash", "Accounts Receivable", "Accounts Payable", "Inventory"], a: 2 },
      { q: "Owner's equity increases with:", options: ["Expenses", "Drawings", "Revenues", "Losses"], a: 2 },
      { q: "The accounting cycle ends with:", options: ["Journalizing", "Posting", "Preparing financial statements", "Closing entries"], a: 3 },
      { q: "A contra account is used to:", options: ["Increase an account balance", "Offset another account", "Record errors", "Calculate taxes"], a: 1 },
      { q: "Inventory valuation methods include:", options: ["FIFO, LIFO, Weighted Average", "Straight-line, Declining balance", "Accrual, Cash", "Debit, Credit"], a: 0 },
      { q: "The conservatism principle suggests:", options: ["Record all possible gains", "Record all possible losses", "Delay recording transactions", "Ignore uncertain events"], a: 1 },
      { q: "Materiality concept means:", options: ["All items must be recorded", "Only significant items need disclosure", "Small items can be ignored", "Only large transactions matter"], a: 1 },
      { q: "A suspense account is used when:", options: ["Trial balance doesn't balance", "Preparing financial statements", "Closing the books", "Calculating depreciation"], a: 0 },
      { q: "The accounting period concept requires:", options: ["Business life to be divided into periods", "All transactions recorded daily", "Financial statements prepared monthly", "Taxes paid annually"], a: 0 },
      { q: "Which is a non-current liability?", options: ["Accounts Payable", "Short-term loan", "Bank overdraft", "Long-term loan"], a: 3 },
      { q: "The purpose of adjusting entries is to:", options: ["Update accounts before financial statements", "Close temporary accounts", "Correct errors", "Record cash transactions"], a: 0 },
      { q: "Closing entries transfer balances to:", options: ["Balance Sheet", "Income Statement", "Retained Earnings", "All of the above"], a: 2 },
      { q: "A post-closing trial balance includes:", options: ["All accounts", "Only permanent accounts", "Only temporary accounts", "Only revenue accounts"], a: 1 },
      { q: "The accounting standard-setting body in Nigeria is:", options: ["FRCN", "ICAN", "ANAN", "All of the above"], a: 3 },
      { q: "IFRS stands for:", options: ["International Financial Reporting Standards", "Internal Financial Review System", "International Fund for Rural Support", "Integrated Financial Resource System"], a: 0 },
      { q: "Which is a qualitative characteristic of financial information?", options: ["Relevance", "Reliability", "Comparability", "All of the above"], a: 3 },
      { q: "The entity concept means:", options: ["Business is separate from owner", "All businesses are the same", "Owners control everything", "Businesses merge annually"], a: 0 },
      { q: "A chart of accounts is:", options: ["A list of all accounts used by a business", "A diagram of organizational structure", "A schedule of asset depreciation", "A plan for future investments"], a: 0 },
      { q: "The purpose of internal controls is to:", options: ["Prevent fraud and errors", "Increase profits", "Reduce taxes", "Improve marketing"], a: 0 },
      { q: "Which is an example of an accounting estimate?", options: ["Cash balance", "Depreciation expense", "Bank loan amount", "Share capital"], a: 1 },
      { q: "The going concern assumption affects:", options: ["Asset valuation", "Liability classification", "Both A and B", "Neither A nor B"], a: 2 },
      { q: "A provision is:", options: ["A liability of uncertain timing or amount", "An asset of uncertain value", "Revenue not yet earned", "Expense already paid"], a: 0 },
      { q: "Contingent liabilities are:", options: ["Recorded on balance sheet", "Disclosed in notes only", "Ignored completely", "Always paid immediately"], a: 1 },
      { q: "The consistency principle requires:", options: ["Same accounting methods used period to period", "All methods changed annually", "Methods chosen randomly", "Methods approved by tax authority"], a: 0 },
      { q: "Full disclosure means:", options: ["All material information must be revealed", "Only positive information shared", "Information shared only with management", "Disclosure optional"], a: 0 },
      { q: "Which is a current liability?", options: ["Mortgage payable", "Bonds payable", "Accounts payable", "Long-term loan"], a: 2 },
      { q: "Retained earnings represent:", options: ["Profits distributed to owners", "Profits reinvested in business", "Initial capital investment", "Borrowed funds"], a: 1 },
      { q: "The statement of cash flows categorizes activities as:", options: ["Operating, Investing, Financing", "Revenue, Expense, Profit", "Asset, Liability, Equity", "Debit, Credit, Balance"], a: 0 },
      { q: "Free cash flow is:", options: ["Cash from operations minus capital expenditures", "Total cash in bank", "Cash available for dividends", "Cash after paying all debts"], a: 0 },
      { q: "The primary users of financial statements are:", options: ["Investors and creditors", "Employees only", "Government only", "Competitors only"], a: 0 }
    ]
  },
  BUA101: {
    title: "Introduction to Business",
    code: "BUA 101",
    department: "Business Administration",
    units: 2,
    duration: 60,
    status: "pending",
    questionsData: [
      { q: "Business is primarily concerned with:", options: ["Making profit", "Social welfare", "Government service", "Charitable activities"], a: 0 },
      { q: "The main objective of a business is to:", options: ["Maximize shareholder wealth", "Provide employment", "Serve the community", "All of the above"], a: 3 },
      { q: "Which is NOT a factor of production?", options: ["Land", "Labor", "Capital", "Profit"], a: 3 },
      { q: "Entrepreneurship involves:", options: ["Taking business risks", "Avoiding innovation", "Following others", "Minimizing effort"], a: 0 },
      { q: "A sole proprietorship is owned by:", options: ["One person", "Two to twenty persons", "Shareholders", "The government"], a: 0 },
      { q: "Limited liability means:", options: ["Owners liable only to amount invested", "No liability at all", "Unlimited personal liability", "Liability shared equally"], a: 0 },
      { q: "The primary function of marketing is to:", options: ["Identify and satisfy customer needs", "Produce goods", "Manage finances", "Hire employees"], a: 0 },
      { q: "The 4 Ps of marketing include:", options: ["Product, Price, Place, Promotion", "People, Process, Physical evidence, Performance", "Planning, Production, Packaging, Pricing", "Profit, Purpose, People, Planet"], a: 0 },
      { q: "Market segmentation is:", options: ["Dividing market into distinct groups", "Combining all customers together", "Ignoring customer differences", "Selling to everyone equally"], a: 0 },
      { q: "A business plan is important because it:", options: ["Provides roadmap for success", "Is required by law", "Guarantees profit", "Eliminates risks"], a: 0 },
      { q: "SWOT analysis examines:", options: ["Strengths, Weaknesses, Opportunities, Threats", "Sales, Work, Operations, Technology", "Strategy, Workflow, Objectives, Targets", "Suppliers, Workers, Owners, Traders"], a: 0 },
      { q: "Corporate social responsibility means:", options: ["Business contributing to society", "Government controlling business", "Employees managing company", "Customers setting prices"], a: 0 },
      { q: "The primary source of business finance is:", options: ["Owner's capital", "Bank loans", "Government grants", "All of the above"], a: 3 },
      { q: "Working capital management involves:", options: ["Managing current assets and liabilities", "Long-term investment decisions", "Employee recruitment", "Product development"], a: 0 },
      { q: "Break-even point is where:", options: ["Total revenue equals total cost", "Profit is maximized", "Sales are zero", "Fixed costs are zero"], a: 0 },
      { q: "A competitive advantage is:", options: ["Something that makes a business better than rivals", "Having more employees", "Lower prices only", "Government protection"], a: 0 },
      { q: "Globalization affects business by:", options: ["Expanding markets and competition", "Limiting trade opportunities", "Reducing technology use", "Eliminating cultural differences"], a: 0 },
      { q: "Ethical business practice means:", options: ["Doing what is morally right", "Maximizing profit at any cost", "Following only legal requirements", "Ignoring stakeholder interests"], a: 0 },
      { q: "The role of management includes:", options: ["Planning, Organizing, Leading, Controlling", "Only hiring and firing", "Only financial decisions", "Only marketing activities"], a: 0 },
      { q: "Organizational structure defines:", options: ["How tasks and responsibilities are allocated", "Product pricing strategy", "Marketing channels", "Customer service policies"], a: 0 },
      { q: "Human resource management focuses on:", options: ["Recruiting, developing, and retaining employees", "Managing financial resources", "Producing goods", "Selling products"], a: 0 },
      { q: "Supply chain management involves:", options: ["Coordinating flow of goods from supplier to customer", "Only purchasing raw materials", "Only warehousing finished goods", "Only transportation"], a: 0 },
      { q: "Quality management aims to:", options: ["Meet or exceed customer expectations", "Reduce employee wages", "Minimize production time only", "Ignore customer feedback"], a: 0 },
      { q: "Innovation in business means:", options: ["Introducing new ideas, methods, or products", "Copying competitors", "Maintaining status quo", "Reducing research spending"], a: 0 },
      { q: "A franchise is:", options: ["Business operating under another's brand and system", "Independent startup", "Government enterprise", "Non-profit organization"], a: 0 },
      { q: "E-commerce refers to:", options: ["Buying and selling online", "Traditional retail only", "Manufacturing processes", "Employee training"], a: 0 },
      { q: "Customer relationship management (CRM) focuses on:", options: ["Building long-term customer relationships", "One-time sales only", "Ignoring customer complaints", "Reducing customer service"], a: 0 },
      { q: "Risk management in business involves:", options: ["Identifying and mitigating potential threats", "Ignoring possible problems", "Taking all risks blindly", "Avoiding all business activities"], a: 0 },
      { q: "The business environment includes:", options: ["Economic, social, political, technological factors", "Only internal company factors", "Only competitor actions", "Only customer preferences"], a: 0 },
      { q: "Strategic planning is:", options: ["Long-term direction setting for the organization", "Daily operational decisions", "Short-term problem solving", "Employee scheduling"], a: 0 },
      { q: "A mission statement describes:", options: ["The organization's purpose and core values", "Financial targets only", "Employee benefits", "Product specifications"], a: 0 },
      { q: "Corporate governance refers to:", options: ["Systems for directing and controlling companies", "Government regulation of all businesses", "Employee union activities", "Customer complaint procedures"], a: 0 },
      { q: "Sustainability in business means:", options: ["Meeting present needs without compromising future generations", "Maximizing short-term profits", "Ignoring environmental concerns", "Focusing only on financial performance"], a: 0 },
      { q: "The primary goal of operations management is to:", options: ["Efficiently produce goods and services", "Only manage employees", "Only handle finances", "Only market products"], a: 0 },
      { q: "Business communication is effective when it is:", options: ["Clear, concise, and audience-appropriate", "Lengthy and detailed", "Technical and complex", "Informal and casual"], a: 0 }
    ]
  },
  ENT101: {
    title: "Introduction to Entrepreneurship",
    code: "ENT 101",
    department: "General",
    units: 2,
    duration: 60,
    status: "pending",
    questionsData: [
      { q: "Entrepreneurship is best defined as:", options: ["The process of identifying opportunities and creating value", "Working for someone else", "Avoiding risks", "Following traditional paths"], a: 0 },
      { q: "An entrepreneur is someone who:", options: ["Takes initiative and bears risk to start a business", "Only manages existing businesses", "Avoids innovation", "Seeks job security only"], a: 0 },
      { q: "The primary motivation for entrepreneurship is often:", options: ["Independence and potential for high rewards", "Guaranteed income", "Minimal effort", "Avoiding responsibility"], a: 0 },
      { q: "A business opportunity is:", options: ["A favorable set of circumstances that creates a need for a new product or service", "Any idea that comes to mind", "A guaranteed success", "A government grant"], a: 0 },
      { q: "Market research helps entrepreneurs to:", options: ["Understand customer needs and market conditions", "Avoid all risks", "Guarantee success", "Eliminate competition"], a: 0 },
      { q: "A business model describes:", options: ["How a company creates, delivers, and captures value", "Only the product features", "Only the pricing strategy", "Only the marketing plan"], a: 0 },
      { q: "Bootstrapping in entrepreneurship means:", options: ["Starting a business with minimal external funding", "Raising large venture capital", "Taking bank loans only", "Waiting for government grants"], a: 0 },
      { q: "The lean startup methodology emphasizes:", options: ["Building, measuring, and learning quickly", "Perfect planning before action", "Large initial investments", "Avoiding customer feedback"], a: 0 },
      { q: "A minimum viable product (MVP) is:", options: ["A product with just enough features to satisfy early customers", "The final perfected product", "A product with all possible features", "A prototype never shown to customers"], a: 0 },
      { q: "Pivot in entrepreneurship refers to:", options: ["Changing business strategy based on learning", "Sticking to original plan regardless", "Closing the business", "Hiring more staff"], a: 0 },
      { q: "Intellectual property protection includes:", options: ["Patents, trademarks, copyrights", "Only business registration", "Only tax filing", "Only employee contracts"], a: 0 },
      { q: "Networking is important for entrepreneurs because it:", options: ["Provides access to resources, knowledge, and opportunities", "Is required by law", "Guarantees funding", "Eliminates competition"], a: 0 },
      { q: "A pitch deck is used to:", options: ["Present business idea to potential investors", "Train employees", "Market to customers", "File taxes"], a: 0 },
      { q: "Venture capital is:", options: ["Funding provided to high-growth startups in exchange for equity", "Government grant for small businesses", "Bank loan with fixed interest", "Personal savings"], a: 0 },
      { q: "Angel investors are:", options: ["Affluent individuals who provide capital for startups", "Government officials", "Bank managers", "Customer advocates"], a: 0 },
      { q: "Crowdfunding allows entrepreneurs to:", options: ["Raise small amounts from many people via online platforms", "Get loans from one bank", "Receive government subsidies", "Avoid market research"], a: 0 },
      { q: "Social entrepreneurship focuses on:", options: ["Creating social value alongside financial returns", "Maximizing profit only", "Avoiding all risks", "Following traditional business models"], a: 0 },
      { q: "Intrapreneurship refers to:", options: ["Entrepreneurial activity within an existing organization", "Starting a business from scratch", "Working as a freelancer", "Investing in stocks"], a: 0 },
      { q: "The biggest challenge for new entrepreneurs is often:", options: ["Access to capital and market validation", "Too much free time", "Excessive government support", "Lack of competition"], a: 0 },
      { q: "A unique selling proposition (USP) is:", options: ["What makes a product/service different and better than competitors", "The lowest price offered", "The most features included", "The longest warranty"], a: 0 },
      { q: "Customer discovery involves:", options: ["Talking to potential customers to validate assumptions", "Ignoring customer feedback", "Assuming you know what customers want", "Only surveying friends and family"], a: 0 },
      { q: "Scaling a business means:", options: ["Growing the business efficiently while maintaining quality", "Hiring as many people as possible", "Spending all profits on marketing", "Expanding to every market immediately"], a: 0 },
      { q: "Exit strategy for entrepreneurs may include:", options: ["Selling the business, IPO, or passing to family", "Only closing the business", "Only continuing forever", "Only filing for bankruptcy"], a: 0 },
      { q: "Entrepreneurial mindset includes:", options: ["Resilience, adaptability, and opportunity recognition", "Risk avoidance", "Preference for routine", "Resistance to change"], a: 0 },
      { q: "Failure in entrepreneurship is often viewed as:", options: ["A learning opportunity", "The end of career", "Something to hide", "A reason to never try again"], a: 0 },
      { q: "Incubators and accelerators help startups by providing:", options: ["Mentorship, resources, and networking opportunities", "Only office space", "Only funding", "Only legal advice"], a: 0 },
      { q: "The importance of a co-founder includes:", options: ["Complementary skills, shared workload, and emotional support", "Only sharing profits", "Only having someone to blame", "Only meeting legal requirements"], a: 0 },
      { q: "Product-market fit is achieved when:", options: ["A product satisfies strong market demand", "The product is technically perfect", "The company has many employees", "The business has a website"], a: 0 },
      { q: "Entrepreneurial ethics involve:", options: ["Conducting business with integrity and social responsibility", "Maximizing profit at any cost", "Ignoring stakeholder interests", "Following only legal minimums"], a: 0 },
      { q: "The future of entrepreneurship is likely shaped by:", options: ["Technology, sustainability, and global connectivity", "Isolation and protectionism", "Resistance to innovation", "Declining consumer expectations"], a: 0 }
    ]
  },
  GST101: {
    title: "General Studies — Use of English",
    code: "GST 101",
    department: "General",
    units: 2,
    duration: 45,
    status: "pending",
    questionsData: [
      { q: "The primary purpose of communication is to:", options: ["Exchange information and ideas", "Impress others", "Avoid conflict", "Win arguments"], a: 0 },
      { q: "Grammar is the study of:", options: ["The structure and rules of language", "Only spelling", "Only vocabulary", "Only pronunciation"], a: 0 },
      { q: "A noun is a word that names:", options: ["A person, place, thing, or idea", "An action", "A description", "A connection"], a: 0 },
      { q: "The subject of a sentence is:", options: ["Who or what the sentence is about", "The action performed", "The description added", "The punctuation used"], a: 0 },
      { q: "A verb expresses:", options: ["Action or state of being", "Only past events", "Only future plans", "Only descriptions"], a: 0 },
      { q: "The predicate of a sentence is:", options: ["What is said about the subject", "The subject itself", "The punctuation", "The conjunction"], a: 0 },
      { q: "An adjective is a word that:", options: ["Describes a noun or pronoun", "Replaces a noun", "Connects clauses", "Shows action"], a: 0 },
      { q: "An adverb modifies:", options: ["A verb, adjective, or another adverb", "Only nouns", "Only pronouns", "Only conjunctions"], a: 0 },
      { q: "A pronoun is used to:", options: ["Replace a noun", "Describe a noun", "Connect sentences", "Show possession only"], a: 0 },
      { q: "The past tense of 'go' is:", options: ["Went", "Gone", "Going", "Goes"], a: 0 },
      { q: "Which is a compound sentence?", options: ["I like tea and coffee", "I like tea, and I like coffee", "I like tea", "Tea and coffee"], a: 1 },
      { q: "A preposition shows relationship between:", options: ["A noun/pronoun and another word", "Two verbs", "Two adjectives", "Two adverbs"], a: 0 },
      { q: "The plural of 'child' is:", options: ["Children", "Childs", "Childes", "Childies"], a: 0 },
      { q: "Which word is a conjunction?", options: ["And", "Quickly", "Beautiful", "Running"], a: 0 },
      { q: "Direct speech is indicated by:", options: ["Quotation marks", "Parentheses", "Hyphens", "Asterisks"], a: 0 },
      { q: "The opposite of 'generous' is:", options: ["Stingy", "Kind", "Wealthy", "Poor"], a: 0 },
      { q: "A synonym for 'happy' is:", options: ["Joyful", "Sad", "Angry", "Tired"], a: 0 },
      { q: "The correct article before 'university' is:", options: ["A", "An", "The", "No article"], a: 0 },
      { q: "Which is correct?", options: ["She don't like it", "She doesn't like it", "She not like it", "She no like it"], a: 1 },
      { q: "The passive voice of 'He wrote the letter' is:", options: ["The letter was written by him", "The letter is written by him", "He was written the letter", "The letter wrote him"], a: 0 },
      { q: "A clause that can stand alone is:", options: ["Independent clause", "Dependent clause", "Subordinate clause", "Relative clause"], a: 0 },
      { q: "The word 'beautifully' is an:", options: ["Adverb", "Adjective", "Noun", "Verb"], a: 0 },
      { q: "Which is a proper noun?", options: ["Lagos", "City", "River", "Mountain"], a: 0 },
      { q: "The comparative form of 'good' is:", options: ["Better", "Gooder", "Best", "More good"], a: 0 },
      { q: "An interrogative sentence:", options: ["Asks a question", "Makes a statement", "Gives a command", "Expresses emotion"], a: 0 },
      { q: "The word 'their' is a:", options: ["Possessive pronoun", "Personal pronoun", "Demonstrative pronoun", "Relative pronoun"], a: 0 },
      { q: "Which is a countable noun?", options: ["Book", "Water", "Sand", "Information"], a: 0 },
      { q: "The superlative of 'bad' is:", options: ["Worst", "Baddest", "Worse", "More bad"], a: 0 },
      { q: "A phrase is a group of words that:", options: ["Does not contain a subject and verb", "Always contains a subject and verb", "Is always a complete sentence", "Cannot function as a noun"], a: 0 },
      { q: "The correct punctuation for a question is:", options: ["Question mark", "Exclamation mark", "Period", "Comma"], a: 0 },
      { q: "Which word is spelled correctly?", options: ["Receive", "Recieve", "Receve", "Receeve"], a: 0 },
      { q: "An imperative sentence:", options: ["Gives a command", "Asks a question", "Makes a statement", "Expresses surprise"], a: 0 },
      { q: "The prefix 'un-' means:", options: ["Not", "Again", "Before", "After"], a: 0 },
      { q: "A homophone is a word that:", options: ["Sounds the same as another but has different meaning", "Has the same spelling as another", "Is spelled backwards", "Has multiple meanings"], a: 0 }
    ]
  }
};

// Sample students for each department
const studentsData = [
  { matric: "111", name: "John Doe", department: "Economics", level: "300", password: "111" },
  { matric: "222", name: "Jane Smith", department: "Accounting", level: "200", password: "222" },
  { matric: "333", name: "David Johnson", department: "Business Administration", level: "100", password: "333" },
  { matric: "444", name: "Sarah Williams", department: "Computer Science", level: "300", password: "444" },
  { matric: "555", name: "Michael Brown", department: "Economics", level: "200", password: "555" },
  { matric: "2500101", name: "Ogundiran Favour", department: "Economics", level: "100", password: "favour" },
  { matric: "2500102", name: "Adekunle Onikoyi", department: "Accounting", level: "200", password: "adekunle" },
  { matric: "2500103", name: "Shittu Abdulquadiri", department: "Business Administration", level: "100", password: "shittu" },
  { matric: "2500104", name: "Aniaefe Badmus", department: "Computer Science", level: "300", password: "aniaefe" }
];

async function seed() {
  try {
    await connectDB();
    console.log('Seeding database...\n');

    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    await Question.deleteMany({});

    // Create admin user
    const admin = new User({
      matric: 'admin',
      name: 'System Administrator',
      department: 'Admin',
      level: 'N/A',
      password: 'admin123',
      role: 'admin'
    });
    await admin.save();
    console.log('Admin created: matric=admin, password=admin123');

    // Create students
    for (const s of studentsData) {
      const student = new User(s);
      await student.save();
      console.log(`Student created: matric=${s.matric}, name=${s.name}, dept=${s.department}`);
    }

    // Create courses and questions
    for (const [courseId, data] of Object.entries(coursesData)) {
      const course = new Course({
        courseId,
        title: data.title,
        code: data.code,
        department: data.department,
        units: data.units,
        duration: data.duration,
        totalQuestions: data.questionsData.length,
        status: data.status
      });
      await course.save();

      // Insert questions
      for (const qData of data.questionsData) {
        await new Question({
          courseId,
          q: qData.q,
          options: qData.options,
          a: qData.a
        }).save();
      }

      console.log(`Course ${courseId}: ${data.title} — ${data.questionsData.length} questions`);
    }

    console.log('\nSeed completed successfully!');
    console.log('\n--- Login Credentials ---');
    console.log('Admin: matric=admin, password=admin123');
    console.log('Student (Economics): matric=111, password=111');
    console.log('Student (Accounting): matric=222, password=222');
    console.log('Student (Business Admin): matric=333, password=333');
    console.log('Student (Computer Science): matric=444, password=444');

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
