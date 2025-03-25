MyTender.io - Your Trusted Bid Writing Solution
=============================================
MyTender.io is your comprehensive bid writing solution, trusted by the best to secure contracts across the UK. Our accredited platform helps take away your bid writing frustrations.

Visit us at `www.mytender.io <https://www.mytender.io>`_


Installation
------------
* Clone the repo
* Run `npm install`
* Run `npm run dev` to start the vite server


Project structure
-----------------
* `src` - contains the source code
* `src/components` - contains the React components
* `src/components/auth` - contains the authentication components
* `src/views` - contains the pages
* `src/routes` - contains the routes
* `src/assets` - contains the images, fonts, etc.


Frontend Architecture Overview
-----------------------------

Frontend Stack
^^^^^^^^^^^^^
* **React**: UI component library
* **TypeScript**: Static typing for improved developer experience
* **React Router**: Client-side routing
* **React Auth Kit**: Authentication and token management
* **Draft.js**: Rich text editing capabilities
* **React Bootstrap & MUI**: UI component libraries
* **Vite**: Build tool and development server

State Management
^^^^^^^^^^^^^^^
The application uses multiple state management strategies:

* **React Context API**: Used to share state across component trees without prop drilling
   - BidContext: Manages bid-related data and operations
   - StatusLabelsContext: Manages bid status labels and colors
   - TabContext: Manages tab navigation state

* **React Hooks**: Local component state with useState, useEffect, useRef
* **LocalStorage**: Persists state between sessions for draft content, auth tokens, and user preferences

Key Features
^^^^^^^^^^^
* **Q&A Generator**: AI-powered question answering system that retrieves information from content libraries
* **Bid Pilot**: Interactive AI assistant for refining answers with various enhancement options
* **Document Editor**: Rich text editing with Draft.js for creating and editing tender responses
* **Wizard System**: Interactive onboarding tours for new users, implemented with custom tooltip components
* **Content Library**: Document management with folder organization and search capabilities

Data Flow
^^^^^^^^
1. **User Authentication**: Managed through React Auth Kit with tokens stored in localStorage
2. **API Communication**: Axios-based HTTP requests to backend services
3. **Real-time Updates**: Components re-render based on context changes or API responses
4. **State Persistence**: Important state is persisted to localStorage and/or the backend API

Analytics & Monitoring
^^^^^^^^^^^^^^^^^^^^^
* **PostHog**: User behavior tracking and analytics
* **Google Analytics**: Web traffic analytics
* **Custom Event Tracking**: Application-specific event tracking for feature usage

Responsive Design
^^^^^^^^^^^^^^^^
The UI adapts to different screen sizes using:
* Bootstrap's responsive grid system
* Custom responsive components
* Media queries for specific breakpoints

Accessibility
^^^^^^^^^^^^
The application implements accessibility features including:
* Semantic HTML
* ARIA attributes
* Keyboard navigation
* Focus management in modal dialogs and wizards


How to contribute
-----------------
* Fork the repo
* Create a new branch
* Make your changes
* Create a pull request back into the dev branch of the original repo
* Your pull request will be reviewed and merged

Keep your branch up to date with the dev branch of the original repo by running `git pull origin dev` while on your branch:

* Add the original repo as a second remote: `git remote add upstream
* Fetch the dev branch of the original repo: `git fetch upstream dev`
* rebase your feature branch on the dev branch of the original repo: `git rebase upstream/dev`
