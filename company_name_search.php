<?php

// This file suggests organisation names when a user references an organisation as a supplier, for instance, when inputting an action.

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

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}

try {
    $pdo = new PDO('mysql:host=localhost;port=3306;dbname=sustainability_log', 'sustainability_log_user', 'sKuuzLPJanW3k6w');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $data = json_decode(file_get_contents('php://input'), true);
    $searchTerm = $data['searchTerm'] ?? '';

    if ($searchTerm) {
        $stmt = $pdo->prepare('
            SELECT DISTINCT name, id 
            FROM users 
            WHERE name LIKE ? 
            LIMIT 10
        ');

        $stmt->execute(['%' . $searchTerm . '%']);
        $companies = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if ($companies) {
            echo json_encode([
                'status' => 'success',
                'companies' => $companies
            ]);
        } else {
            echo json_encode([
                'status' => 'error',
                'message' => 'No companies found'
            ]);
        }
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'Search term is required'
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
