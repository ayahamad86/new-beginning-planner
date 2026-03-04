# New Beginning Budget Planner

A modern, comprehensive budget planning application built with Next.js 14, TypeScript, Tailwind CSS, and Prisma. Track income, manage bills, monitor emergency fund goals, and gain insights into your spending patterns through reflective journaling.

## 🚀 Features

### Core Features
- **Dashboard**: Real-time financial overview with key metrics
  - Monthly income estimate
  - Bills due in the next 7 days
  - Emergency fund progress
  - Emotional spending highlights

- **Income Management**
  - CRUD operations for income sources
  - Support for multiple frequencies (monthly, bi-weekly, weekly, annual)
  - **Income Change Simulator**: Adjust income by percentage to see projected budget impact
  - Monthly income calculation with automatic normalization

- **Bills Management**
  - Track recurring and one-time bills
  - Categorize bills (rent, utilities, subscriptions, etc.)
  - Mark bills as paid/unpaid
  - Monthly status overview
  - Organized by due date

- **Emergency Fund**
  - Set financial goals with target amounts and dates
  - Automatic recommended monthly contribution calculation
  - Progress visualization
  - Quick-add buttons for contributions
  - Track savings progress toward goal

- **Reflection & Journaling**
  - Journal entries with emotional spending tracking
  - Mood tracking
  - Trigger identification for spending patterns
  - Weekly insights with:
    - Total emotional spending
    - Top spending triggers
    - Entry count analytics

### Technical Features
- ✅ **Authentication**: Custom email/password authentication with bcrypt hashing
- ✅ **Server Actions**: For secure backend operations
- ✅ **Form Validation**: Comprehensive input validation on client and server
- ✅ **Responsive Design**: Mobile-first design for all devices
- ✅ **PDF Export**: Generate monthly budget summaries as PDF
- ✅ **Database**: SQLite with Prisma ORM
- ✅ **TypeScript**: Full type safety throughout the application

## 📋 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite (Prisma)
- **Authentication**: Custom (bcryptjs)
- **UI Components**: Custom React components + Lucide Icons
- **Export**: jsPDF for PDF generation
- **Package Manager**: npm

## 🛠️ Local Setup

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/new-beginning-planner.git
   cd new-beginning-planner
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env.local file
   cp .env.local.example .env.local
   ```

   Edit `.env.local` and set:
   ```
   DATABASE_URL="file:./prisma/dev.db"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-change-in-production"
   ```

4. **Initialize the database**
   ```bash
   # Generate Prisma client
   npm run prisma:generate
   
   # Create database tables
   npm run db:push
   
   # Seed sample data
   npm run prisma:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`

### Demo Credentials
Once seeded, use these credentials to log in:
- **Email**: `demo@example.com`
- **Password**: `DemoPass123`

## 📚 Available Commands

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

# Database
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations
npm run prisma:seed      # Seed sample data
npm run db:push          # Push schema to database
npm run db:studio        # Open Prisma Studio GUI
```

## 📁 Project Structure

```
new-beginning-planner/
├── app/
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Login/Register page
│   ├── globals.css                # Global styles
│   ├── dashboard/page.tsx          # Dashboard
│   ├── bills/page.tsx              # Bills management
│   ├── income/page.tsx             # Income management
│   ├── emergency/page.tsx          # Emergency fund
│   ├── reflection/page.tsx         # Journal/Reflections
│   └── api/export-pdf/route.ts     # PDF export endpoint
├── components/
│   ├── AuthenticatedLayout.tsx     # Navigation & layout
│   ├── Button.tsx                  # Button component
│   ├── Card.tsx                    # Card component
│   ├── Form.tsx                    # Input, TextArea, Select
│   ├── ProgressBar.tsx             # Progress visualization
│   ├── SummaryCard.tsx             # Dashboard summary cards
│   └── Spinner.tsx                 # Loading states
├── lib/
│   ├── auth.ts                     # Auth utilities
│   ├── db.ts                       # Prisma client
│   ├── utils.ts                    # Helper functions
│   ├── validators.ts               # Form validation
│   ├── pdf-export.ts               # PDF generation
│   └── actions/
│       ├── auth.ts                 # Auth server actions
│       ├── bills.ts                # Bills server actions
│       ├── income.ts               # Income server actions
│       ├── reflections.ts          # Reflections server actions
│       └── emergency.ts            # Emergency fund actions
├── prisma/
│   ├── schema.prisma               # Database schema
│   ├── seed.js                     # Seed script
│   └── dev.db                      # SQLite database (generated)
├── public/                         # Static assets
├── .env.local                      # Environment variables (local)
├── next.config.js                  # Next.js configuration
├── tailwind.config.ts              # Tailwind configuration
├── tsconfig.json                   # TypeScript configuration
├── package.json                    # Dependencies
└── README.md                       # This file
```

## 🔑 Key Features Explained

### Income Change Simulator
Adjust income by a percentage to see how your budget room changes. Perfect for:
- Salary negotiation planning
- Potential income change scenarios
- Budget forecasting

### Weekly Insights
Automatic analysis of your reflections to identify:
- Total emotional spending trends
- Top spending triggers
- Most common emotional states during spending

### Emergency Fund Calculator
Automatically calculates:
- Recommended monthly contributions
- Time to reach goal
- Progress percentage
- Days remaining to target date

## 🔐 Security Notes

- Passwords are hashed with bcryptjs (10 rounds)
- Sensitive operations use server actions
- Input validation on both client and server
- Change `NEXTAUTH_SECRET` in production
- Use environment variables for secrets
- Database should not be committed to version control

## 📊 Database Schema

The app uses 5 main models:

### User
- Basic user information and authentication

### Income
- Income sources with flexible frequency options
- Monthly equivalents calculated on-the-fly

### Bill
- Monthly bills with due dates and payment status
- Organized by month/year

### Reflection
- Journal entries with emotional spending tracking
- Mood and trigger identification

### EmergencyFund
- Single record per user
- Automatic recommendation calculation

## 🛣️ Future Enhancements

- [ ] Budget templates
- [ ] Recurring bill automation
- [ ] Expense categorization
- [ ] Data visualization charts
- [ ] Mobile app
- [ ] Multi-currency support
- [ ] Recurring/automated transactions
- [ ] Family/shared budget features
- [ ] Goal tracking with notifications

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 💬 Support

For support, email support@newbeginningplanner.com or create an issue on GitHub.

## 🎯 Getting Started Tips

1. **Start with Demo Data**: Use the seeded demo account to explore all features
2. **Add Your Income**: Update the income sources to match your actual income
3. **Enter Your Bills**: Input all monthly bills to see accurate budget calculations
4. **Set Emergency Goal**: Define your emergency fund target to start tracking
5. **Journal Regularly**: Use reflections to identify spending patterns

---

Built with ❤️ for better financial wellness.
