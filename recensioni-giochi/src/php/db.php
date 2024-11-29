<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "recensioni_giochi";

// Creazione della connessione
$conn = new mysqli($servername, $username, $password, $dbname);

// Controllo della connessione
if ($conn->connect_error) {
    die("Connessione al database fallita: " . $conn->connect_error);
}

?>
