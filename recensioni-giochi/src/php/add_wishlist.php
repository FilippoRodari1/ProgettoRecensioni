<?php
// Impostazioni per il CORS e il tipo di contenuto
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173"); // Permetti l'accesso dal frontend locale
header("Access-Control-Allow-Methods: POST, GET, OPTIONS"); // Specifica i metodi permessi
header("Access-Control-Allow-Headers: Content-Type, Authorization"); // Specifica gli header permessi
header("Content-Type: application/json"); // Imposta il Content-Type a JSON

// Gestisci la richiesta OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0); // Risposta vuota per le richieste OPTIONS
}

// Includi il file di connessione al database
include('db.php');

// Verifica la connessione al database
if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "Errore di connessione al database: " . $conn->connect_error]);
    exit();
}

// Ricevi i dati POST
$data = json_decode(file_get_contents('php://input'), true);
$email = $data['user_id'] ?? null; // Uso l'email invece dell'ID utente
$game_id = $data['game_id'] ?? null;

// Controlla che ci siano i dati necessari
if ($email && $game_id) {
    // Verifica se l'utente esiste nel database
    $stmt = $conn->prepare("SELECT id FROM utenti WHERE email = ?");
    $stmt->bind_param("s", $email); // Usa 's' per l'email (string)
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows == 0) {
        // L'utente non esiste
        echo json_encode(["status" => "error", "message" => "L'utente non esiste"]);
        $stmt->close();
        $conn->close();
        exit();
    }

    // Ottieni l'ID dell'utente
    $stmt->bind_result($user_id);
    $stmt->fetch();
    $stmt->close();

    // Aggiungi il gioco alla wishlist
    $stmt = $conn->prepare("INSERT INTO wishlist (user_id, game_id) VALUES (?, ?)");
    $stmt->bind_param("ii", $user_id, $game_id); // 'i' per integer (user_id e game_id)

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Gioco aggiunto alla wishlist"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Errore nell'aggiunta alla wishlist: " . $stmt->error]);
    }

    $stmt->close();
} else {
    echo json_encode(["status" => "error", "message" => "ID utente o ID gioco mancanti"]);
}

$conn->close();
?>
