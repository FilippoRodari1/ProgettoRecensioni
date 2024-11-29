<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173"); // Permetti l'accesso dal frontend locale
header("Access-Control-Allow-Methods: POST, GET, OPTIONS"); // Specifica i metodi permessi
header("Access-Control-Allow-Headers: Content-Type, Authorization"); // Specifica gli header permessi
header("Content-Type: application/json"); // Imposta il Content-Type a JSON

include('db.php'); // Inclusione del file di connessione

$data = json_decode(file_get_contents('php://input'), true);
$action = $data['action'] ?? '';
$user_email = $data['user_email'] ?? '';
$game_id = $data['game_id'] ?? '';

if (!$user_email) {
    echo json_encode(['status' => 'error', 'message' => 'Email utente mancante']);
    exit;
}

// Funzione per caricare la wishlist
if ($action === 'get') {
    try {
        $stmt = $conn->prepare("SELECT * FROM wishlist WHERE user_email = ?");
        $stmt->bind_param("s", $user_email); // 's' per stringa (email)
        $stmt->execute();
        $result = $stmt->get_result();
        $wishlist = $result->fetch_all(MYSQLI_ASSOC);

        if (empty($wishlist)) {
            echo json_encode(['status' => 'error', 'message' => 'Carica dei giochi tramite il cuoricino!']);
        } else {
            echo json_encode(['status' => 'success', 'wishlist' => $wishlist]);
        }
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => 'Errore nel recupero della wishlist']);
    }
}

// Funzione per aggiungere un gioco alla wishlist
if ($action === 'add') {
    try {
        $stmt = $conn->prepare("INSERT INTO wishlist (user_email, game_id) VALUES (?, ?)");
        $stmt->bind_param("si", $user_email, $game_id); // 's' per email e 'i' per id gioco
        $stmt->execute();
        
        echo json_encode(['status' => 'success', 'message' => 'Gioco aggiunto alla wishlist']);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => 'Errore nell\'aggiunta alla wishlist']);
    }
}

// Funzione per rimuovere un gioco dalla wishlist
if ($action === 'remove') {
    try {
        $stmt = $conn->prepare("DELETE FROM wishlist WHERE user_email = ? AND game_id = ?");
        $stmt->bind_param("si", $user_email, $game_id); // 's' per email e 'i' per id gioco
        $stmt->execute();
        
        echo json_encode(['status' => 'success', 'message' => 'Gioco rimosso dalla wishlist']);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => 'Errore nella rimozione dalla wishlist']);
    }
}

exit();


?>
