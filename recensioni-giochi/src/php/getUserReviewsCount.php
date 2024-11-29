<?php
header("Access-Control-Allow-Origin: http://localhost:5173");  // Aggiungi il dominio frontend
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

header('Content-Type: application/json');

// Connessione al database
$host = 'localhost';
$user = 'root'; // Cambia con il tuo utente MySQL
$password = ''; // Cambia con la tua password MySQL
$dbname = 'recensioni_giochi'; // Cambia con il nome del tuo database
$conn = new mysqli($host, $user, $password, $dbname);

// Controlla se la connessione è riuscita
if ($conn->connect_error) {
    echo json_encode(['error' => 'Errore di connessione al database.']);
    exit();
}

// Ricevi i dati inviati
$userEmail = $_GET['userEmail']; // L'email dell'utente viene passata come parametro GET

if (empty($userEmail)) {
    echo json_encode(['error' => 'Email utente non fornita.']);
    exit();
}

// Prepara la query SQL per ottenere il conteggio delle recensioni per l'utente (con email)
$stmt = $conn->prepare("SELECT COUNT(*) AS count FROM reviews WHERE user_id = ?");
$stmt->bind_param('s', $userEmail); // 's' per email (stringa)
$stmt->execute();
$result = $stmt->get_result();

// Estrai il conteggio delle recensioni
$row = $result->fetch_assoc();
$reviewCount = $row['count'];

// Restituisci il conteggio come JSON
echo json_encode(['count' => $reviewCount]);

$stmt->close();
$conn->close();
?>
