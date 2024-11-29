<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173'); 
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

$host = 'localhost';
$db = 'recensioni_giochi';
$user = 'root';
$pass = '';
$conn = new mysqli($host, $user, $pass, $db);

// Check connection
if ($conn->connect_error) {
    die(json_encode(['error' => 'Connessione al database fallita: ' . $conn->connect_error]));
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    $email = $data->email ?? '';
    $password = $data->password ?? '';

    // Validate email and password
    if (empty($email) || empty($password)) {
        echo json_encode(['error' => 'Email e password sono obbligatori']);
        exit;
    }

    $stmt = $conn->prepare("SELECT email, password FROM utenti WHERE email = ?");
    if ($stmt) {
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 1) {
            $user = $result->fetch_assoc();
            $userId = $user['email'];
            $hashedPassword = $user['password'];

            if ($password === $hashedPassword) {
                $_SESSION['user_email'] = $userId; 
                echo json_encode(['user' => $email]);
            } else {
                echo json_encode(['error' => 'Credenziali non valide']);
            }
        } else {
            echo json_encode(['error' => 'Credenziali non valide']);
        }
        $stmt->close();
    } else {
        echo json_encode(['error' => 'Errore nella preparazione della query']);
    }
}

$conn->close(); 
?>
