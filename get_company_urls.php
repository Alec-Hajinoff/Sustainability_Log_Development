<?php
require_once 'session_config.php';

$allowed_origins = [
    "https://sustainabilitylog.com",
    "https://www.sustainabilitylog.com"
];

header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

try {
    $pdo = new PDO('mysql:host=localhost;port=3306;dbname=sustainability_log', 'sustainability_log_user', 'sKuuzLPJanW3k6w', [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false
    ]);

    $stmt = $pdo->query('SELECT name, timeline_url FROM users');
    $companies = $stmt->fetchAll();

    echo json_encode(['status' => 'success', 'companies' => $companies]);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database error']);
}
