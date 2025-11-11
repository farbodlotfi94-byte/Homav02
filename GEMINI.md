# Project Overview

This is a React-based web application for "Homa V.0", a product visualization tool. It allows users to select a product, upload a photo of their space, and see a visualization of the product in their environment, presumably using AI-based image processing. The application is built with Vite, TypeScript, and React, and it uses React Router for navigation. The UI is built with a combination of custom components and UI libraries like Radix UI.

The application flow consists of several steps:
1.  **Product Selection:** Users can select a product from a list.
2.  **Product Landing Page:** A dedicated page for the selected product.
3.  **User Authentication:** Users need to log in or register before uploading a photo.
4.  **Photo Upload:** Users can upload a photo of their space.
5.  **AI Processing:** The uploaded photo is processed by an AI service to place the product in the user's space.
6.  **Visualization:** The final visualization is displayed to the user.
7.  **Feedback and Sharing:** Users can provide feedback and share the visualization.

The project also includes an admin dashboard for managing products and other aspects of the application.

# Building and Running

To build and run the project, follow these steps:

1.  **Install Dependencies:**
    ```bash
    npm i
    ```

2.  **Run the Development Server:**
    ```bash
    npm run dev
    ```

3.  **Build for Production:**
    ```bash
    npm run build
    ```

# Development Conventions

*   **Component-Based Architecture:** The application is structured around reusable React components, located in the `src/components` directory.
*   **Styling:** The project uses CSS for styling, with a global stylesheet at `src/styles/globals.css`.
*   **State Management:** The main application state is managed within the `App.tsx` component using React hooks.
*   **API Integration:** The application interacts with a backend API for product data, user authentication, and AI image processing. The API client and services are located in `src/services` and `src/utils`.
*   **Type Safety:** The project uses TypeScript for type safety, with type definitions located in the `src/types` directory.
