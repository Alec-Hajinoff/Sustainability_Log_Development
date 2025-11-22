<?php
require_once 'session_config.php';

$allowed_origins = [
    "https://sustainabilitylog.com",
    "https://www.sustainabilitylog.com"
];

header('Access-Control-Allow-Origin: https://sustainabilitylog.com');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

try {
    if (!isset($_SESSION['id'])) {
        echo json_encode(['status' => 'error', 'message' => 'Not logged in']);
        exit;
    }

    $pdo = new PDO('mysql:host=localhost;port=3306;dbname=sustainability_log', 'sustainability_log_user', 'sKuuzLPJanW3k6w', [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false
    ]);

    $stmt = $pdo->prepare('SELECT timeline_url, qr_code FROM users WHERE id = ?');
    $stmt->execute([$_SESSION['id']]);
    $company = $stmt->fetch();

    if ($company && $company['timeline_url']) {
        echo json_encode([
            'status' => 'success',
            'timeline_url' => $company['timeline_url'],
            'qr_code' => $company['qr_code']
        ]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Timeline URL not found']);
    }
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database error']);
}
