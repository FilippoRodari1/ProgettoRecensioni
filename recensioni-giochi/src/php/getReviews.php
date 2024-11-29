<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");


// Connessione al database
$host = 'localhost';
$user = 'root'; // Cambia con il tuo utente MySQL
$password = ''; // Cambia con la tua password MySQL
$dbname = 'retro_games'; // Cambia con il nome del tuo database
$conn = new mysqli($host, $user, $password, $dbname);

// Controlla se la connessione è riuscita
if ($conn->connect_error) {
    echo json_encode(['error' => 'Errore di connessione al database.']);
    exit();
}

// Ricevi i dati inviati
$gameId = $_GET['id']; // L'ID del gioco viene passato come parametro GET

if (empty($gameId)) {
    echo json_encode(['error' => 'ID gioco non fornito.']);
    exit();
}

// Prepara la query SQL per ottenere le recensioni per un determinato gioco
$stmt = $conn->prepare("SELECT user_name, review, user_id, rating FROM recensioni WHERE game_id = ?");
$stmt->bind_param('i', $gameId);
$stmt->execute();
$result = $stmt->get_result();

// Crea un array per memorizzare le recensioni
$reviews = [];

while ($row = $result->fetch_assoc()) {
    $reviews[] = $row;
}

echo json_encode($reviews);

$stmt->close();
$conn->close();
?>
