<?php

// This file fetches data from the database to populate the company-user dashboard in CreateAction.js.

$allowed_origins = [
    "https://sustainabilitylog.com",
    "https://www.sustainabilitylog.com"
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Allow-Credentials: true');
} else {
    header('HTTP/1.1 403 Forbidden');
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;  // Handle preflight request
}

require_once 'session_config.php';

$userId = $_SESSION['id'] ?? null;

if (!$userId) {
    echo json_encode([
        'status' => 'error',
        'message' => 'User not authenticated'
    ]);
    exit;
}

$env = parse_ini_file(__DIR__ . '/.env');  // We are picking up the encryption key from .env to decrypt the agreement text.
$encryption_key = $env['ENCRYPTION_KEY'];

try {
    $pdo = new PDO('mysql:host=localhost;port=3306;dbname=sustainability_log', 'sustainability_log_user', 'sKuuzLPJanW3k6w');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);

    $stmt = $pdo->prepare('
        SELECT 
            AES_DECRYPT(a.action_text, ?) as decrypted_text,
            a.files,
            a.action_timestamp,
            a.action_hash,
            a.category
        FROM actions a
        WHERE a.user_id = ?
    ');
    $stmt->execute([$encryption_key, $userId]);

    $agreements = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if ($agreements) {
        $results = array_map(function ($agreement) {
            return [
                'description' => $agreement['decrypted_text'],
                'files' => base64_encode($agreement['files']),  // Converting binary to string, required for JSON transport.
                'timestamp' => $agreement['action_timestamp'],
                'hash' => $agreement['action_hash'],
                'category' => $agreement['category']
            ];
        }, $agreements);

        echo json_encode([
            'status' => 'success',
            'agreements' => $results
        ]);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'No sustainability actions found for this company.'
        ]);
    }
} catch (PDOException $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Database error: ' . $e->getMessage()
    ]);
} finally {
    $pdo = null;
}
