<?php

// This file is the database call to send the agreement text submitted by the user to the database.

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

$env = parse_ini_file(__DIR__ . '/.env'); // We are picking up the encryption key from .env to encrypt the agreement text.
$encryption_key = $env['ENCRYPTION_KEY'];

$servername = "127.0.0.1";
$username = "root";
$passwordServer = "";
$dbname = "sustainability_log";

try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $passwordServer);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
} catch (PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}

$id = $_SESSION['id'] ?? null;
$agreement_text = $_POST['agreement_text'] ?? null;
$file = $_FILES['file'] ?? null;

if (!$id) {
    echo json_encode(['success' => false, 'message' => 'Session expired or invalid']);
    exit;
}

if (!$agreement_text) {
    echo json_encode(['success' => false, 'message' => 'Agreement text is required']);
    exit;
}

try {
    $conn->beginTransaction();

    $file_content = null; // Initialise file content variable.

    // The below if statement - if file is present and there is no error, extract content and put into temporary location: $file['tmp_name'].

    if ($file && $file['error'] === UPLOAD_ERR_OK) { 
        $file_content = file_get_contents($file['tmp_name']);
    }

    $hash_content = $agreement_text;

    // The below if statement - if file content is present, concatenate it with text.

    if ($file_content) {
        $hash_content .= base64_encode($file_content);
    }

    $agreement_hash = hash('sha256', $hash_content); // This hashes the entire string, text and file.

    $sql = "INSERT INTO agreements (agreement_text, agreement_hash, user_id, files) VALUES (AES_ENCRYPT(?, ?), ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception('Failed to prepare agreement insert statement');
    }

    $stmt->bindParam(1, $agreement_text);
    $stmt->bindParam(2, $encryption_key);
    $stmt->bindParam(3, $agreement_hash);
    $stmt->bindParam(4, $id);
    $stmt->bindParam(5, $file_content);
    $stmt->execute();

    $conn->commit();

    echo json_encode([
        'success' => true,
        'hash' => $agreement_hash
    ]);
} catch (Exception $e) {
    $conn->rollBack();
    echo json_encode(['success' => false, 'message' => 'Transaction failed: ' . $e->getMessage()]);
} finally {
    $conn = null;
}

/*
// This file is the database call to send the agreement text submitted by the user to the database.

require_once 'session_config.php';

error_reporting(E_ALL);
ini_set('display_errors', 1);

// Log incoming request
file_put_contents('debug.log', print_r($_POST, true) . "\n", FILE_APPEND);
file_put_contents('debug.log', print_r($_FILES, true) . "\n", FILE_APPEND);

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

$env = parse_ini_file(__DIR__ . '/.env'); // We are picking up the encryption key from .env to encrypt the agreement text.
$encryption_key = $env['ENCRYPTION_KEY'];

$servername = "127.0.0.1";
$username = "root";
$passwordServer = "";
$dbname = "sustainability_log";

try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $passwordServer);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
} catch (PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}

$id = $_SESSION['id'] ?? null;
$agreement_text = $_POST['agreement_text'] ?? null;
$file = $_FILES['file'] ?? null;

file_put_contents('debug.log', "POST data: " . print_r($_POST, true) . "\n", FILE_APPEND);
file_put_contents('debug.log', "Session ID: " . print_r($id, true) . "\n", FILE_APPEND);
file_put_contents('debug.log', "Agreement Text: " . print_r($agreement_text, true) . "\n", FILE_APPEND);
file_put_contents('debug.log', "File: " . print_r($file, true) . "\n", FILE_APPEND);

if (!$id) {
    file_put_contents('debug.log', "Session ID missing\n", FILE_APPEND);
    echo json_encode(['success' => false, 'message' => 'Session expired or invalid']);
    exit;
}

if (!$agreement_text) {
    file_put_contents('debug.log', "Agreement text missing\n", FILE_APPEND);
    echo json_encode(['success' => false, 'message' => 'Agreement text is required']);
    exit;
}

try {
    $conn->beginTransaction();

    // Convert file to base64 if exists
    $file_content = null;
    if ($file && $file['error'] === UPLOAD_ERR_OK) {
        $file_content = file_get_contents($file['tmp_name']);
        file_put_contents('debug.log', "File processed successfully\n", FILE_APPEND);
    }

    // Create hash from combination of text and file
    $hash_content = $agreement_text;
    if ($file_content) {
        $hash_content .= base64_encode($file_content);
    }
    $agreement_hash = hash('sha256', $hash_content);

    $sql = "INSERT INTO agreements (agreement_text, agreement_hash, user_id, files) VALUES (AES_ENCRYPT(?, ?), ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception('Failed to prepare agreement insert statement');
    }

    $stmt->bindParam(1, $agreement_text);
    $stmt->bindParam(2, $encryption_key);
    $stmt->bindParam(3, $agreement_hash);
    $stmt->bindParam(4, $id);
    $stmt->bindParam(5, $file_content);
    $stmt->execute();

    $conn->commit();

    echo json_encode([
        'success' => true,
        'hash' => $agreement_hash
    ]);
} catch (Exception $e) {
    $conn->rollBack();
    echo json_encode(['success' => false, 'message' => 'Transaction failed: ' . $e->getMessage()]);
} finally {
    $conn = null;
}
*/

/*
// This file is the database call to send the agreement text submitted by the user to the database.

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

$env = parse_ini_file(__DIR__ . '/.env'); // We are picking up the encryption key from .env to encrypt the agreement text.
$encryption_key = $env['ENCRYPTION_KEY'];

$servername = "127.0.0.1";
$username = "root";
$passwordServer = "";
$dbname = "sustainability_log";

try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $passwordServer);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
} catch (PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}

$json = file_get_contents('php://input');
$data = json_decode($json, true);
$id = $_SESSION['id'] ?? null;
$agreement_text = $data['agreement_text'] ?? null;

if (!$id || !$agreement_text) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

try {
    $conn->beginTransaction();

    $agreement_hash = hash('sha256', $agreement_text); // Uses PHP’s built-in hash() function to compute a cryptographic hash using the SHA-256 algorithm.

    $sql = "INSERT INTO agreements (agreement_text, agreement_hash, user_id) VALUES (AES_ENCRYPT(?, ?), ?, ?)"; // AES_ENCRYPT() is a built-in MySQL function for encrypting.
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception('Failed to prepare agreement insert statement');
    }

    $stmt->bindParam(1, $agreement_text);
    $stmt->bindParam(2, $encryption_key);
    $stmt->bindParam(3, $agreement_hash);
    $stmt->bindParam(4, $id);
    $stmt->execute();

    $conn->commit();

    echo json_encode([
        'success' => true,
        'hash' => $agreement_hash
    ]);
} catch (Exception $e) {
    $conn->rollBack();
    echo json_encode(['success' => false, 'message' => 'Transaction failed: ' . $e->getMessage()]);
} finally {
    $conn = null;
}
*/