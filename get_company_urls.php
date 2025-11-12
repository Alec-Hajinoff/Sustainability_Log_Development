<?php
require_once 'session_config.php';

header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

try {
    $pdo = new PDO('mysql:host=localhost;dbname=sustainability_log', 'root', '', [
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
