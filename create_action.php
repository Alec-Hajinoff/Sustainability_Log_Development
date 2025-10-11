<?php

// This file is the database call to send the text + the file submitted by the user.

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

    $agreement_hash = hash('sha256', $hash_content); // This hashes the entire string (text and file).

    $sql = "INSERT INTO agreements (agreement_text, agreement_hash, user_id, files, countersigned_timestamp) VALUES (AES_ENCRYPT(?, ?), ?, ?, ?, NOW())";
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

    // Get the timestamp that was just inserted
    $timestampStmt = $conn->prepare("SELECT UNIX_TIMESTAMP(countersigned_timestamp) as unix_timestamp FROM agreements WHERE agreement_hash = ?");
    $timestampStmt->execute([$agreement_hash]);
    $timestamp = $timestampStmt->fetch(PDO::FETCH_ASSOC)['unix_timestamp'];

    // Call Express server to write to blockchain
    $ch = curl_init("http://localhost:8002/call-express");
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'agreementHash' => $agreement_hash,
        'timestamp' => intval($timestamp)
    ]));

    $response = curl_exec($ch);
    $curlError = curl_error($ch);
    curl_close($ch);

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
