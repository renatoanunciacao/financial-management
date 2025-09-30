erDiagram

    User {
        string id PK
        string name
        string email
        string password
        string authProvider
        string picture
    }

    MonthlyData {
        string id PK
        date month
        float plannedIncome
        dateTime createdAt
        dateTime updatedAt
    }

    FixedExpense {
        string id PK
        string name
        float amount
        date dueDate
        boolean isPaid
        dateTime createdAt
        dateTime updatedAt
    }

    InstallmentExpense {
        string id PK
        string name
        float amount
        date dueDate
        boolean isPaid
        int installmentNumber
        int totalInstallments
        dateTime createdAt
        dateTime updatedAt
    }

    Borrower {
        string id PK
        string name
    }

    Debt {
        string id PK
        string borrowerName
        float amount
        date dueDate
        boolean isPaid
        dateTime createdAt
        dateTime updatedAt
    }

    Transaction {
        string id PK
        string type
        float amount
        string description
        date date
        dateTime createdAt
        dateTime updatedAt
    }

    Card {
        string id PK
        string name
    }

    Category {
        string id PK
        string name
    }

    PasswordResetToken {
        string id PK
        string token
        dateTime expiresAt
        dateTime createdAt
    }

    %% Relações
    User ||--o{ MonthlyData : "has"
    User ||--o{ Transaction : "has"
    User ||--o{ Card : "has"
    User ||--o{ Category : "has"
    User ||--o{ Debt : "has"
    User ||--o{ PasswordResetToken : "has"

    MonthlyData ||--o{ FixedExpense : "has"
    MonthlyData ||--o{ InstallmentExpense : "has"
    MonthlyData ||--o{ Borrower : "has"

    Borrower ||--o{ Debt : "has"
    Debt ||--o{ InstallmentExpense : "has"

    Card ||--o{ InstallmentExpense : "linked to"
    Card ||--o{ Debt : "linked to"

    Category ||--o{ Transaction : "classifies"

