-- CreateTable
CREATE TABLE "User" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "employeeCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "customerCode" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SalesGroup" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "groupCode" TEXT NOT NULL,
    "groupName" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Order" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "orderNumber" TEXT NOT NULL,
    "customerId" BIGINT NOT NULL,
    "assignedSalesGroupId" BIGINT,
    "status" TEXT NOT NULL,
    "orderTitle" TEXT NOT NULL,
    "notes" TEXT,
    "createdById" BIGINT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Order_assignedSalesGroupId_fkey" FOREIGN KEY ("assignedSalesGroupId") REFERENCES "SalesGroup" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Order_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OrderAssignment" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "orderId" BIGINT NOT NULL,
    "userId" BIGINT NOT NULL,
    "assignmentType" TEXT NOT NULL,
    "assignedById" BIGINT,
    "assignedAt" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "OrderAssignment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OrderAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OrderAssignment_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SalesGroupMember" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "salesGroupId" BIGINT NOT NULL,
    "userId" BIGINT NOT NULL,
    "role" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL,
    CONSTRAINT "SalesGroupMember_salesGroupId_fkey" FOREIGN KEY ("salesGroupId") REFERENCES "SalesGroup" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SalesGroupMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AssignmentRule" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "salesGroupId" BIGINT NOT NULL,
    "priority" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AssignmentRule_salesGroupId_fkey" FOREIGN KEY ("salesGroupId") REFERENCES "SalesGroup" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AssignmentRuleCondition" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "assignmentRuleId" BIGINT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "expectedValue" TEXT NOT NULL,
    "priority" INTEGER NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AssignmentRuleCondition_assignmentRuleId_fkey" FOREIGN KEY ("assignmentRuleId") REFERENCES "AssignmentRule" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OrderHistory" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "orderId" BIGINT NOT NULL,
    "actionType" TEXT NOT NULL,
    "changedById" BIGINT NOT NULL,
    "beforeData" JSONB,
    "afterData" JSONB,
    "createdAt" DATETIME NOT NULL,
    CONSTRAINT "OrderHistory_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OrderHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AssignmentHistory" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "orderId" BIGINT NOT NULL,
    "previousUserId" BIGINT,
    "newUserId" BIGINT NOT NULL,
    "changeType" TEXT NOT NULL,
    "changedById" BIGINT NOT NULL,
    "createdAt" DATETIME NOT NULL,
    CONSTRAINT "AssignmentHistory_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AssignmentHistory_previousUserId_fkey" FOREIGN KEY ("previousUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "AssignmentHistory_newUserId_fkey" FOREIGN KEY ("newUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AssignmentHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Discussion" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "orderId" BIGINT NOT NULL,
    "title" TEXT NOT NULL,
    "createdById" BIGINT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL,
    CONSTRAINT "Discussion_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Discussion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DiscussionMessage" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "discussionId" BIGINT NOT NULL,
    "userId" BIGINT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DiscussionMessage_discussionId_fkey" FOREIGN KEY ("discussionId") REFERENCES "Discussion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DiscussionMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_employeeCode_key" ON "User"("employeeCode");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_customerCode_key" ON "Customer"("customerCode");

-- CreateIndex
CREATE UNIQUE INDEX "SalesGroup_groupCode_key" ON "SalesGroup"("groupCode");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "OrderAssignment_orderId_userId_assignmentType_key" ON "OrderAssignment"("orderId", "userId", "assignmentType");

-- CreateIndex
CREATE UNIQUE INDEX "SalesGroupMember_salesGroupId_userId_key" ON "SalesGroupMember"("salesGroupId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "AssignmentRuleCondition_assignmentRuleId_fieldName_key" ON "AssignmentRuleCondition"("assignmentRuleId", "fieldName");
