<?php

require_once 'session_config.php';

$allowed_origins = [
    "https://sustainabilitylog.com",
    "https://www.sustainabilitylog.com"
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header('HTTP/1.1 403 Forbidden');
    exit;
}

header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}

$env = parse_ini_file(__DIR__ . '/.env');
$encryption_key = $env['ENCRYPTION_KEY'];

$slug = $_GET['slug'] ?? '';

try {
    $pdo = new PDO('mysql:host=localhost;port=3306;dbname=sustainability_log', 'sustainability_log_user', 'sKuuzLPJanW3k6w');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);

    if ($slug) {
        $stmt = $pdo->prepare('SELECT id, name FROM users WHERE timeline_url LIKE ?');
        $stmt->execute(['%/timeline/' . $slug]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
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
            $stmt->execute([$encryption_key, $user['id']]);
            $agreements = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $results = array_map(function ($agreement) {
                return [
                    'description' => $agreement['decrypted_text'],
                    'files' => base64_encode($agreement['files']),
                    'timestamp' => $agreement['action_timestamp'],
                    'hash' => $agreement['action_hash'],
                    'category' => $agreement['category']
                ];
            }, $agreements);

            echo json_encode([
                'success' => true,
                'company_name' => $user['name'],
                'actions' => $results
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Company not found'
            ]);
        }
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Slug is required'
        ]);
    }
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
} finally {
    $pdo = null;
}
