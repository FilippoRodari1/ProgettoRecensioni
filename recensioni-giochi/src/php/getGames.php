<?php
session_start();
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");


function getGames() {
    $apiKey = '6f6106458dab44b9ba5f8c8e723633f7';
    $url = "https://api.rawg.io/api/games?page=1&key=$apiKey";

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    
    if (curl_errno($ch)) {
        echo json_encode(['success' => false, 'message' => 'Error: ' . curl_error($ch)]);
        curl_close($ch);
        return;
    }

    curl_close($ch);
    $data = json_decode($response, true);

    if (isset($data['error'])) {
        echo json_encode(['success' => false, 'message' => 'API Error: ' . $data['error']]);
        return;
    }

    return $data;
}

$games = getGames();
echo json_encode($games);
?>
