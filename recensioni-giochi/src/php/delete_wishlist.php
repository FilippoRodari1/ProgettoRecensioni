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

// Verifica se l'utente è autenticato
if (!isset($_SESSION['user_email'])) {
    echo json_encode(['error' => 'Non autenticato']);
    exit();
}

// Recupera i dati dell'utente dalla sessione
$email = $_SESSION['user_email'];
$game_id = $_POST['game_id'] ?? null;

// Verifica che l'ID del gioco sia passato
if (!$game_id) {
    echo json_encode(['error' => 'Game ID mancante']);
    exit();
}


// Controlla se il gioco è presente nella wishlist dell'utente
$query = $conn->prepare("SELECT * FROM wishlist WHERE user_email = ? AND game_id = ?");
$query->bind_param("si", $email, $game_id);
$query->execute();
$result = $query->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['error' => 'Il gioco non è nella wishlist']);
} else {
    // Rimuovi il gioco dalla wishlist
    $deleteQuery = $conn->prepare("DELETE FROM wishlist WHERE user_email = ? AND game_id = ?");
    $deleteQuery->bind_param("si", $email, $game_id);
    if ($deleteQuery->execute()) {
        echo json_encode(['status' => 'success']);
    } else {
        echo json_encode(['error' => 'Errore nel rimuovere il gioco']);
    }
}

// Chiudi la connessione
$query->close();
$deleteQuery->close();
$conn->close();
?>

