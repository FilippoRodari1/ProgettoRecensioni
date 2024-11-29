<?php
session_start();

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Gestisci le richieste OPTIONS per il preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Connessione al database
$host = 'localhost';
$db = 'recensioni_giochi';
$user = 'root';
$pass = '';
$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    http_response_code(500);
    die(json_encode(['message' => 'Errore di connessione al database.']));
}

// Recupera e valida i dati dalla richiesta
$data = json_decode(file_get_contents('php://input'), true);

$nome = trim($data['nome'] ?? '');
$cognome = trim($data['cognome'] ?? '');
$email = filter_var($data['email'] ?? '', FILTER_VALIDATE_EMAIL);
$password = $data['password'] ?? '';
$dataNascita = $data['dataNascita'] ?? '';

if (!$nome || !$cognome || !$email || !$password || !$dataNascita) {
    http_response_code(400);
    die(json_encode(['message' => 'Tutti i campi sono obbligatori.']));
}

if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $dataNascita)) {
    http_response_code(400);
    die(json_encode(['message' => 'Formato data di nascita non valido. Usare YYYY-MM-DD.']));
}

$dataNascitaTimestamp = strtotime($dataNascita);
if (!$dataNascitaTimestamp) {
    http_response_code(400);
    die(json_encode(['message' => 'Data di nascita non valida.']));
}

$etaMinima = 13;
$etaMassima = 120;
$oggi = new DateTime();
$dataNascitaDate = new DateTime($dataNascita);
$eta = $oggi->diff($dataNascitaDate)->y;

if ($eta < $etaMinima) {
    http_response_code(400);
    die(json_encode(['message' => 'Devi avere almeno 13 anni per registrarti.']));
}
if ($eta > $etaMassima) {
    http_response_code(400);
    die(json_encode(['message' => 'Data di nascita troppo lontana nel passato.']));
}

// Inserimento nel database con query preparata
$stmt = $conn->prepare("INSERT INTO utenti (nome, cognome, data_nascita, email, password) VALUES (?, ?, ?, ?, ?)");
if (!$stmt) {
    http_response_code(500);
    die(json_encode(['message' => 'Errore nella preparazione della query.']));
}

// Usa la password in chiaro
$stmt->bind_param("sssss", $nome, $cognome, $dataNascita, $email, $password);

if ($stmt->execute()) {
    echo json_encode(['message' => 'Registrazione avvenuta con successo.']);
} else {
    http_response_code(500);
    echo json_encode(['message' => 'Errore nella registrazione.']);
}

$stmt->close();
$conn->close();
?>
