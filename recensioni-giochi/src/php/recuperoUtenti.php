<?php
header("Access-Control-Allow-Origin: http://localhost:5173"); // Specifica l'origine del frontend
header("Access-Control-Allow-Credentials: true"); // Consente le credenziali
header("Access-Control-Allow-Methods: GET, OPTIONS"); // Specifica i metodi consentiti
header("Access-Control-Allow-Headers: Content-Type, Authorization"); // Specifica gli header consentiti

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$host = 'localhost';
$db = 'recensioni_giochi';
$user = 'root';
$pass = '';
$conn = new mysqli($host, $user, $pass, $db);

// Verifica la connessione al database
if ($conn->connect_error) {
    echo json_encode(['error' => 'Errore di connessione al database']);
    exit();
}

// Query SQL per recuperare tutti gli utenti con il conteggio delle recensioni
$query = "
    SELECT utenti.nome, utenti.cognome, utenti.avatar, 
           COUNT(reviews.id) AS reviewCount
    FROM utenti
    LEFT JOIN reviews ON utenti.email = reviews.user_id
    GROUP BY utenti.email
    ORDER BY reviewCount DESC;
";

$result = $conn->query($query);

if ($result->num_rows > 0) {
    $users = [];
    while ($row = $result->fetch_assoc()) {
        $users[] = $row;
    }
    echo json_encode($users);
} else {
    echo json_encode([]);
}

// Chiudi la connessione
$conn->close();
?>
