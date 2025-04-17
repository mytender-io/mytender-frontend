# MyTender.io - AI-Powered Bid Writing & RFP Response Solution

## Win More Bids with AI-Powered Tender Writing & Proposal Automation

MyTender.io is your comprehensive bid writing and RFP response solution, trusted by the best to secure contracts across the UK and beyond. Our accredited platform helps take away your bid writing frustrations by leveraging the power of AI to transform your proposal development process.

- **75% Reduction in Bid Writing Time**: Focus on strategy, not paperwork - respond to RFPs and ITTs faster
- **Enterprise-Scale AI**: Seamlessly integrate with your existing proposal workflows and bid management systems
- **Centralised Data Management**: Secure repository for all tender-related data, previous submissions, and procurement documents
- **AI-Powered Response Generation**: Intelligent editing tools that align proposals with specific tender requirements and evaluation criteria
- **Industry-Leading Security**: SOC 2, GDPR, and ISO27001 compliant for all your sensitive proposal and tender documents

[Visit our website](https://www.mytender.io) | [Book a Demo](https://www.mytender.io/demo)

## Backed by Fuel Ventures: £250K Investment to Transform Your Bidding Experience

We're proud to announce that MyTender.io has secured £250,000 in pre-seed funding from Fuel Ventures, marking a significant milestone in our journey to revolutionize the tender and RFP response industry. This investment underscores the credibility of our platform and our vision for the future of bid writing.

### What This Means For You:

- **Enhanced AI Development**: We're scaling our AI capabilities to deliver even more intelligent, context-aware RFP responses
- **Expanded Team**: Growing our talent across AI development, bid writing expertise, sales, and customer success
- **Accelerated Innovation**: Implementing an ambitious product roadmap with new features designed around your success
- **Improved Personalization**: Creating more tailored solutions that adapt to the specific requirements of your industry and procurement challenges

Our roadmap includes developing an agentic AI system that maximizes the scoring potential of every response, introducing AI review and scoring tools, enhancing collaboration features, and providing personalized tracking and reporting for complete transparency over your bidding metrics.

## Why Choose MyTender.io for Your RFP and Tender Responses?

### Write Bids & Proposals Faster

Our technology puts time back with your bid writers and proposal teams by providing high-quality draft responses to new tenders based on your previous bids. You only have to focus on refining your client strategy and win themes while our AI handles the heavy lifting of RFP response development.

### Win More Bids & Increase Contract Success Rates

In the competitive world of tendering and public procurement, standing out is crucial. We enhance your bid writing capabilities, enabling you to create client-focused responses that capture the attention of assessors and evaluation committees. Our platform helps you maximize your bid scores and improve win rates.

### Secure Data Infrastructure for Sensitive Procurement Documents

Client data and procurement information is stored individually in their own secure environment, outside of open-source AI and the internet. We maintain the highest standards of data security with full compliance to GDPR, SOC 2, and ISO27001, ensuring your competitive tender responses remain confidential.

## Technical Documentation

### Installation

```bash
# Clone the repo
git clone https://github.com/mytender-io/mytender-frontend.git
# Install dependencies
npm install
# Start development server
npm run dev
```

### Project Structure

- `src` - contains the source code
- `src/components` - contains the React components
- `src/components/auth` - contains the authentication components
- `src/views` - contains the pages
- `src/routes` - contains the routes
- `src/assets` - contains the images, fonts, etc.

### Frontend Architecture Overview

#### Frontend Stack

- **React**: UI component library
- **TypeScript**: Static typing for improved developer experience
- **React Router**: Client-side routing
- **React Auth Kit**: Authentication and token management
- **Draft.js**: Rich text editing capabilities
- **React Bootstrap & MUI**: UI component libraries
- **Vite**: Build tool and development server

#### State Management

The application uses multiple state management strategies:

- **React Context API**: Used to share state across component trees without prop drilling
  - BidContext: Manages bid-related data and operations
  - StatusLabelsContext: Manages bid status labels and colors
  - TabContext: Manages tab navigation state
- **React Hooks**: Local component state with useState, useEffect, useRef
- **LocalStorage**: Persists state between sessions for draft content, auth tokens, and user preferences

#### Key Features

- **Q&A Generator**: AI-powered question answering system that retrieves information from content libraries to quickly respond to RFP questions
- **Bid Pilot**: Interactive AI assistant for refining answers with various enhancement options to meet evaluation criteria
- **Document Editor**: Rich text editing with Draft.js for creating and editing tender responses and proposal documents
- **Wizard System**: Interactive onboarding tours for new users to quickly master the proposal development process
- **Content Library**: Document management with folder organisation and search capabilities for storing and retrieving previous RFP responses

#### Data Flow

1. **User Authentication**: Managed through React Auth Kit with tokens stored in localStorage
2. **API Communication**: Axios-based HTTP requests to backend services
3. **Real-time Updates**: Components re-render based on context changes or API responses
4. **State Persistence**: Important state is persisted to localStorage and/or the backend API

#### Analytics & Monitoring

- **PostHog**: User behavior tracking and analytics
- **Google Analytics**: Web traffic analytics
- **Custom Event Tracking**: Application-specific event tracking for feature usage

#### Responsive Design

The UI adapts to different screen sizes using:

- Bootstrap's responsive grid system
- Custom responsive components
- Media queries for specific breakpoints

#### Accessibility

The application implements accessibility features including:

- Semantic HTML
- ARIA attributes
- Keyboard navigation
- Focus management in modal dialogs and wizards

### How to Contribute

1. Fork the repo
2. Create a new branch
3. Make your changes
4. Create a pull request back into the dev branch of the original repo
5. Your pull request will be reviewed and merged

Keep your branch up to date with the dev branch of the original repo:

```bash
# Add the original repo as a second remote
git remote add upstream https://github.com/mytender-io/mytender-frontend.git
# Fetch the dev branch of the original repo
git fetch upstream dev
# Rebase your feature branch on the dev branch of the original repo
git rebase upstream/dev
```

## About MyTender.io

MyTender.io was founded to transform the bid writing process for businesses across multiple sectors including IT Services, Financial Services, Construction, Healthcare, Telecoms, and Public Sector vendors. Our platform addresses the challenges of responding to complex RFPs, government tenders, and competitive procurement opportunities.

Our AI-powered solution is designed by bid writers for bid writers, providing an intuitive experience that seamlessly fits into your existing proposal workflows. Whether you're responding to RFPs, RFIs, RFQs, ITTs or any other procurement format, MyTender.io streamlines your process and improves your win rate.

With Fuel Ventures' backing, we're positioned to deliver even greater value to both current and future clients. We're committed to continuous innovation and customer-centric development, ensuring our platform evolves to meet the changing needs of the procurement landscape.

### Industries We Serve

- **IT & Technology Services**: Respond to complex technical RFPs with precision
- **Construction & Facilities Management**: Win more public and private sector contracts
- **Healthcare & Pharmaceutical**: Navigate complex procurement processes efficiently
- **Financial & Professional Services**: Create compelling proposals that stand out
- **Government & Public Sector Suppliers**: Meet strict compliance requirements while crafting winning responses

### Contact Us

- Email: [info@mytender.io](mailto:info@mytender.io)
- Website: [www.mytender.io](https://www.mytender.io)

---

© Copyright mytender.io All Rights Reserved
