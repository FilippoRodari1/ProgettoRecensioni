<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173"); // Specifica l'origine del frontend
header("Access-Control-Allow-Credentials: true"); // Consente le credenziali
header("Access-Control-Allow-Methods: GET, OPTIONS"); // Specifica i metodi consentiti
header("Access-Control-Allow-Headers: Content-Type, Authorization"); // Specifica gli header consentiti

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Verifica se l'utente è autenticato
if (!isset($_SESSION['user_email'])) {
    echo json_encode(['error' => 'Non autenticato']);
    exit();
}

// Recupera i dati dell'utente dal database
$email = $_SESSION['user_email'];
$host = 'localhost';
$db = 'recensioni_giochi';
$user = 'root';
$pass = '';
$conn = new mysqli($host, $user, $pass, $db);

// Verifica la connessione al database
if ($conn->connect_error) {
    echo json_encode(['error' => 'Errore di connessione al database']);
    exit();
}

// Prepara ed esegui la query SQL
$query = $conn->prepare("SELECT nome, cognome, email, data_nascita, avatar FROM utenti WHERE email = ?");
$query->bind_param("s", $email);
$query->execute();
$result = $query->get_result();
$userData = $result->fetch_assoc();

// Verifica se i dati dell'utente sono stati trovati
if (!$userData) {
    echo json_encode(['error' => 'Nessun utente trovato']);
} else {
    echo json_encode($userData);
}

// Chiudi la connessione
$query->close();
$conn->close();
?>
