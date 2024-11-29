<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

include 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['userId']) && isset($data['gameId']) && isset($data['review']) && isset($data['rating']) && isset($data['userName'])) {
    $user_email = $data['userId'];  // userId è ora l'email dell'utente
    $game_id = $data['gameId'];
    $review = $conn->real_escape_string($data['review']);
    $rating = (int)$data['rating'];
    $user_name = $conn->real_escape_string($data['userName']);

    $response = [
        'user_id' => $user_email,  
        'game_id' => $game_id,
        'review' => $review,
        'rating' => $rating,
        'user_name' => $user_name,
    ];

    $stmt = $conn->prepare("INSERT INTO reviews (user_id, game_id, review, rating, user_name) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("sssss", $user_email, $game_id, $review, $rating, $user_name);

    if ($stmt->execute()) {
        $response['message'] = 'Recensione inviata con successo!';
    } else {
        $response['error'] = 'Errore nel salvataggio della recensione: ' . $stmt->error;
    }

    echo json_encode($response);
    $stmt->close();
} else {
    echo json_encode(['error' => 'Dati mancanti']);
}
?>
