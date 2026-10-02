import csv
import unittest
from pathlib import Path
from urllib.parse import urlparse

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

BASE = "https://storage01.dbe.academy/232.02.webdev/test-023.login/"
OUTPUT = Path("testergebnisse")
OUTPUT.mkdir(exist_ok=True)
RESULTS = []


class WebseiteTests(unittest.TestCase):
    def setUp(self):
        self.driver = webdriver.Chrome()
        self.driver.set_window_size(1280, 900)
        self.wait = WebDriverWait(self.driver, 10)

    def tearDown(self):
        self.driver.quit()

    def open_page(self, page):
        self.driver.get(BASE + page)

    def fill(self, field, value):
        element = self.driver.find_element(By.ID, field)
        element.clear()
        element.send_keys(value)

    def submit(self):
        self.driver.find_element(
            By.CSS_SELECTOR, "button[type='submit']"
        ).click()

    def check_text(self, text):
        self.wait.until(
            EC.text_to_be_present_in_element((By.TAG_NAME, "body"), text)
        )

    def check_page(self, page):
        self.wait.until(
            lambda driver: urlparse(driver.current_url).path.endswith(
                "/" + page
            )
        )

    def record(self, name, expected, action):
        status = "Bestanden"
        actual = "Erwartetes Ergebnis angezeigt"

        try:
            action()
        except Exception as error:
            status = "Fehler"
            actual = (
                f"{type(error).__name__}: {str(error)[:300]} | "
                f"URL: {self.driver.current_url} | "
                f"Seitentext: "
                f"{self.driver.find_element(By.TAG_NAME, 'body').text[:700]}"
            )
            raise
        finally:
            screenshot = OUTPUT / f"{self._testMethodName}.png"
            self.driver.save_screenshot(str(screenshot))
            RESULTS.append([name, expected, actual, status, screenshot.name])

    def login(self, password):
        self.open_page("index.php")
        self.fill("email", "testuser@test.de")
        self.fill("password", password)
        self.submit()

    def test_01_login_gueltig(self):
        def action():
            self.login("Passwort123")
            self.check_page("welcome.php")
            self.check_text("Login erfolgreich!")

        self.record(
            "Login gültig",
            "welcome.php und Login erfolgreich!",
            action,
        )

    def test_02_login_falsch(self):
        def action():
            self.login("FalschesPasswort")
            self.check_text("Ungültige Zugangsdaten!")

        self.record("Login falsch", "Ungültige Zugangsdaten!", action)

    def test_03_login_leer(self):
        def action():
            self.open_page("index.php")
            self.submit()
            self.check_text("Bitte alle Felder ausfüllen!")

        self.record("Login leer", "Bitte alle Felder ausfüllen!", action)

    def test_04_navigation_kontakt(self):
        def action():
            self.open_page("index.php")
            self.driver.find_element(By.LINK_TEXT, "Kontakt").click()
            self.check_page("contact.php")

        self.record("Navigation Kontakt", "contact.php", action)

    def test_05_navigation_startseite(self):
        def action():
            self.open_page("contact.php")
            self.driver.find_element(By.LINK_TEXT, "Startseite").click()
            self.check_page("index.php")

        self.record("Navigation Startseite", "index.php", action)

    def test_06_kontakt_leer(self):
        def action():
            self.open_page("contact.php")
            self.submit()
            self.check_text("Bitte Name und E-Mail eingeben!")

        self.record(
            "Kontaktformular leer",
            "Bitte Name und E-Mail eingeben!",
            action,
        )

    def test_07_kontakt_email_ungueltig(self):
        def action():
            self.open_page("contact.php")
            self.fill("name", "Testnutzer")
            self.fill("email", "abc")
            self.submit()
            self.check_text("Ungültige E-Mail!")

        self.record("Kontakt E-Mail ungültig", "Ungültige E-Mail!", action)

    def test_08_kontakt_gueltig(self):
        def action():
            self.open_page("contact.php")
            self.fill("name", "Testnutzer")
            self.fill("email", "abc@test.de")
            self.fill("message", "Testnachricht für die Übungsaufgabe.")
            self.submit()
            self.check_text("Nachricht erfolgreich gesendet!")

        self.record(
            "Kontaktformular gültig",
            "Nachricht erfolgreich gesendet!",
            action,
        )


if __name__ == "__main__":
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(WebseiteTests)
    result = unittest.TextTestRunner(verbosity=2).run(suite)

    with (OUTPUT / "testbericht.csv").open(
        "w", newline="", encoding="utf-8-sig"
    ) as file:
        writer = csv.writer(file, delimiter=";")
        writer.writerow([
            "Testfall", "Erwartetes Ergebnis",
            "Tatsächliches Ergebnis", "Status", "Screenshot"
        ])
        writer.writerows(RESULTS)

    print(f"\nIzveštaj i screenshots: {OUTPUT.resolve()}")
    raise SystemExit(0 if result.wasSuccessful() else 1)