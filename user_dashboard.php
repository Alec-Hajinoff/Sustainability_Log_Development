<?php

// This file fetches data from the database to populate the company-user dashboard in CreateAgreement.js.

require_once 'session_config.php';

$allowed_origins = [
    "http://localhost:3000"
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header("HTTP/1.1 403 Forbidden");
    exit;
}

header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}

$env = parse_ini_file(__DIR__ . '/.env'); // We are picking up the encryption key from .env to decrypt the agreement text.
$encryption_key = $env['ENCRYPTION_KEY'];

try {
    $pdo = new PDO("mysql:host=127.0.0.1;dbname=sustainability_log", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);

    $stmt = $pdo->prepare('
            SELECT 
                AES_DECRYPT(a.agreement_text, ?) as decrypted_text,
                a.files,
                a.countersigned_timestamp,
                a.agreement_hash
            FROM agreements a
            JOIN users u ON a.user_id = u.id
        ');

    $stmt->execute([$encryption_key]);
    $agreements = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if ($agreements) {
        $results = array_map(function ($agreement) {
            return [
                'description' => $agreement['decrypted_text'],
                'files' => base64_encode($agreement['files']),  // Converting binary to string, required for JSON transport.
                'timestamp' => $agreement['countersigned_timestamp'],
                'hash' => $agreement['agreement_hash']
            ];
        }, $agreements);

        echo json_encode([
            'status' => 'success',
            'agreements' => $results
        ]);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'No agreements found for this company'
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
