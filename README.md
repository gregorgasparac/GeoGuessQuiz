# GeoGuess Quiz

GeoGuess Quiz is an application where users participate in a geographical quiz and compete with other players.

## Technologies

- **Backend**: XAMPP (MySQL), Node.js, Express.js
- **Frontend**: JavaScript, HTML, CSS
- **Client Applications**: Web app

### Prerequisites

Before setting up the project, ensure you have the following software installed:

- XAMPP with MySQL
- Node.js (includes npm)

### Installation

Follow these steps to install and configure the project locally:

1. **Backend Setup**:
   - Install XAMPP with MySQL.
   - Start the MySQL server.

2. **Frontend Setup**:
   - No specific installation steps needed for frontend. Ensure you have a modern web browser.

3. **Clone the Repository**:
    ```bash
    git clone https://github.com/gregorgasparac/GeoGuessQuiz.git
    cd Quiz
   ```
     
4. **Install Dependencies**:
   - Install the required Node.js dependencies, including Express.js:


    ```bash
    npm install
    ```

   - This command will install all the dependencies listed in the package.json, including Express.js.
     
5. **Database Configuration**:
    - Create a MySQL database for GeoGuess Quiz and import the necessary schema.

6. **Configure Backend**:
    - Create a .env file in the backend folder for sensitive configurations like JWT secrets. Here's an example .env file structure:

    ```bash
    ACCESS_TOKEN_SECRET=your_access_token_secret
    REFRESH_TOKEN_SECRET=your_refresh_token_secret
    ```

    - ACCESS_TOKEN_SECRET: Used to sign short-lived access tokens for user authentication.
    - REFRESH_TOKEN_SECRET: Used to sign long-lived refresh tokens for re-issuing access tokens.
    - Ensure both secrets are strong and unique.

### Security and Authentication

The application uses JSON Web Token (JWT) for secure user authentication:

- When a user logs in or registers, a token is generated using the JWT_SECRET.
- This token is required to access secure endpoints and is verified for validity on each request.
- Ensure the JWT_SECRET in your .env file is strong and kept confidential.


### Running the Backend

- Ensure you are in the backend folder:

```bash
cd your_nodejs_folder
```
- Start the backend server:

```bash
node main.js
```




