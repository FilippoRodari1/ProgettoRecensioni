<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173"); // Specify your frontend's origin
header("Access-Control-Allow-Credentials: true"); // Allow credentials
header("Access-Control-Allow-Methods: GET, POST, OPTIONS"); // Specify allowed methods
header("Access-Control-Allow-Headers: Content-Type, Authorization"); // Specify allowed headers

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Log out the user
session_destroy();

header('Content-Type: application/json');
echo json_encode(['message' => 'Logout effettuato con successo']);
?>
