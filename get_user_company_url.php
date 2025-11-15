<?php
require_once 'session_config.php';

header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

try {
    if (!isset($_SESSION['id'])) {
        echo json_encode(['status' => 'error', 'message' => 'Not logged in']);
        exit;
    }

    $pdo = new PDO('mysql:host=localhost;dbname=sustainability_log', 'root', '', [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false
    ]);

    $stmt = $pdo->prepare('SELECT timeline_url FROM users WHERE id = ?');
    $stmt->execute([$_SESSION['id']]);
    $company = $stmt->fetch();

    if ($company && $company['timeline_url']) {
        echo json_encode(['status' => 'success', 'timeline_url' => $company['timeline_url']]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Timeline URL not found']);
    }
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database error']);
}
