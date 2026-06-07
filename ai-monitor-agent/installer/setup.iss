; ============================================================
; AI Monitor Agent — Instalador
; Compilar con Inno Setup 6 (https://jrsoftware.org/isinfo.php)
; ============================================================

#define AppName    "AI Monitor Agent"
#define AppVersion "1.0.0"
#define AppPublisher "AI Monitor"
#define AppExeName "agent.exe"
#define TaskName   "AI-Monitor-Agent"

[Setup]
AppId={{8A3F2C1D-4B5E-4F6A-9C2D-1E3F5A7B9D0E}
AppName={#AppName}
AppVersion={#AppVersion}
AppPublisher={#AppPublisher}
DefaultDirName={localappdata}\AI-Monitor-Agent
DefaultGroupName={#AppName}
DisableProgramGroupPage=yes
OutputDir=..\dist
OutputBaseFilename=AI-Monitor-Agent-Setup
Compression=lzma2/ultra64
SolidCompression=yes
PrivilegesRequired=lowest
WizardStyle=modern
WizardSizePercent=110
SetupIconFile=
UninstallDisplayName={#AppName}
UninstallDisplayIcon={app}\{#AppExeName}
CloseApplications=yes

[Languages]
Name: "spanish"; MessagesFile: "compiler:Languages\Spanish.isl"

[Files]
Source: "..\dist\{#AppExeName}"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{userstartup}\{#AppName}"; Filename: "{app}\{#AppExeName}"; Comment: "AI Monitor Agent (autostart)"

[Run]
Filename: "{app}\{#AppExeName}"; Description: "Iniciar el agente ahora"; Flags: nowait postinstall skipifsilent

[UninstallRun]
Filename: "schtasks.exe"; Parameters: "/Delete /TN ""{#TaskName}"" /F"; Flags: runhidden; RunOnceId: "DelTask"

[Code]
var
  ServerUrlPage : TInputQueryWizardPage;
  ClaudePathPage: TInputQueryWizardPage;

{ ---- Crear páginas de configuración ---- }
procedure InitializeWizard;
begin
  { Página 1: URL del servidor }
  ServerUrlPage := CreateInputQueryPage(
    wpWelcome,
    'Configuración del servidor',
    'Indicá la URL del servidor AI Monitor',
    'El agente subirá las estadísticas a esta dirección cada 5 minutos.'
  );
  ServerUrlPage.Add('URL del servidor:', False);
  ServerUrlPage.Values[0] := 'http://192.168.1.100:3001';

  { Página 2: carpeta .claude (opcional) }
  ClaudePathPage := CreateInputQueryPage(
    ServerUrlPage.ID,
    'Carpeta de Claude Code',
    'Ruta de la carpeta .claude del usuario',
    'Normalmente se detecta automáticamente. Dejá el valor sugerido si no estás seguro.'
  );
  ClaudePathPage.Add('Carpeta .claude:', False);
  ClaudePathPage.Values[0] := ExpandConstant('{userdocs}\..\') + '.claude';
end;

{ ---- Validar URL antes de continuar ---- }
function NextButtonClick(CurPageID: Integer): Boolean;
var
  URL: String;
begin
  Result := True;
  if CurPageID = ServerUrlPage.ID then
  begin
    URL := Trim(ServerUrlPage.Values[0]);
    if URL = '' then
    begin
      MsgBox('La URL del servidor es requerida.', mbError, MB_OK);
      Result := False;
    end else if (Pos('http://', URL) = 0) and (Pos('https://', URL) = 0) then
    begin
      MsgBox('La URL debe comenzar con http:// o https://', mbError, MB_OK);
      Result := False;
    end;
  end;
end;

{ ---- Crear agent.config.json con los datos ingresados ---- }
procedure CreateConfigFile;
var
  ConfigPath : String;
  ConfigLines: TArrayOfString;
  ServerUrl  : String;
  ClaudeDir  : String;
begin
  ConfigPath := ExpandConstant('{app}\agent.config.json');

  { No sobreescribir si ya existe (token previo) }
  if FileExists(ConfigPath) then
  begin
    { Solo actualizar serverUrl y claudeDir preservando el token }
    Exit;
  end;

  ServerUrl := Trim(ServerUrlPage.Values[0]);
  ClaudeDir := Trim(ClaudePathPage.Values[0]);
  { Escapar backslashes para JSON }
  StringChangeEx(ClaudeDir, '\', '\\', True);

  SetArrayLength(ConfigLines, 5);
  ConfigLines[0] := '{';
  ConfigLines[1] := '  "serverUrl": "' + ServerUrl + '",';
  ConfigLines[2] := '  "claudeDir": "' + ClaudeDir + '"';
  ConfigLines[3] := '}';
  ConfigLines[4] := '';
  SaveStringsToFile(ConfigPath, ConfigLines, False);
end;

{ ---- Crear Tarea Programada ---- }
procedure CreateScheduledTask;
var
  ExePath   : String;
  TaskParams: String;
  ResultCode: Integer;
begin
  ExePath    := ExpandConstant('{app}\{#AppExeName}');
  TaskParams := '/Create /F /TN "{#TaskName}" /TR "\"' + ExePath + '\"" /SC ONLOGON /RL LIMITED /DELAY 0001:00';

  if not Exec('schtasks.exe', TaskParams, '', SW_HIDE, ewWaitUntilTerminated, ResultCode) then
    MsgBox('No se pudo crear la tarea programada.' + #13#10 +
           'Podés ejecutar el agente manualmente: ' + ExePath,
           mbInformation, MB_OK);
end;

{ ---- Post-instalación ---- }
procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssPostInstall then
  begin
    CreateConfigFile;
    CreateScheduledTask;
  end;
end;

{ ---- Post-desinstalación: borrar archivos de datos ---- }
procedure CurUninstallStepChanged(CurUninstallStep: TUninstallStep);
begin
  if CurUninstallStep = usPostUninstall then
  begin
    DeleteFile(ExpandConstant('{app}\agent.config.json'));
    RemoveDir(ExpandConstant('{app}'));
  end;
end;
