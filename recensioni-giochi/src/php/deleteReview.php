<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

include 'db.php'; // Connessione al database

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['user_id']) || !isset($data['game_id'])) {
    echo json_encode(['error' => 'Dati mancanti. Verifica che user_id e game_id siano presenti.']);
    exit;
}

$user_id = $data['user_id'];
$game_id = $data['game_id'];

// Query per eliminare la recensione
$query = "DELETE FROM reviews WHERE user_id = ? AND game_id = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param("ss", $user_id, $game_id);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Recensione eliminata con successo.']);
} else {
    echo json_encode(['error' => 'Errore nell\'eliminazione della recensione.']);
}

$stmt->close();
$conn->close();
?>
