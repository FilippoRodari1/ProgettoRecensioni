<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Rispondi alla richiesta OPTIONS con un codice 200 (utile per preflight CORS)
    http_response_code(200);
    exit();
}

// Verifica se l'utente è autenticato
if (!isset($_SESSION['user_email'])) {
    echo json_encode(['success' => false, 'error' => 'Utente non loggato']);
    exit;
}

$email = $_SESSION['user_email'];

// Connessione al database
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "recensioni_giochi"; // Cambia con il nome del tuo database

$conn = new mysqli($servername, $username, $password, $dbname);

// Verifica la connessione
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Ricevi i dati dell'avatar dal corpo della richiesta (base64)
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['avatar'])) {
    echo json_encode(['success' => false, 'error' => 'Avatar non fornito']);
    exit;
}

// L'avatar è già in formato base64, quindi non serve decodificarlo
$avatar = $data['avatar'];

// Prepara e esegui la query per aggiornare l'avatar nel database
$sql = "UPDATE utenti SET avatar = ? WHERE email = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ss", $avatar, $email);

// Esegui la query
if ($stmt->execute()) {
    // Se l'aggiornamento ha avuto successo
    echo json_encode(['success' => true]);
} else {
    // Se la query non ha aggiornato nulla
    echo json_encode(['success' => false, 'error' => 'Errore nell\'aggiornamento dell\'avatar']);
}

// Chiudi la connessione e lo statement
$stmt->close();
$conn->close();
?>
