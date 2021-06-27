# Test płynności Newcombe z użyciem wykrywania mowy w JavaScript dla przeglądarki internetowej

Ta aplikacja pozwala przeprowadzić test płynności Newcombe używając mikrofonu badanej osoby. 
Test polega na na wymienianiu nazw zwierząt, roślin, ptaków w czasie 30 sekund.
Osoby z deficytami poznawczymi wypowiadają mniejszą liczbę słów [zobacz źródło](https://journals.viamedica.pl/psychiatria/article/view/40894/32069).
Na zapisane wyniki testu składa się:
* Identyfikator sesji
* Liczba słów referencyjnych
* Liczba słów rozpoznanych
* Liczba dopasowanych słów
* Wynik procentowy dopasowania

## Wymagania

* A subscription key for the Speech service. See [Wypróbuj bezpłatnie](https://docs.microsoft.com/azure/cognitive-services/speech-service/get-started).
* Komputer PC lub Mac, z działającym mikrofonem.
* Edytor tekstu.
* Opcjonalnie, serwer obsługujący hosting skryptów PHP.

## Budowa

* **Pobierając Microsoft Cognitive Services Speech SDK przy budowie tej aplikacji, akceptujesz [warunki licencji Speech SDK](https://docs.microsoft.com/azure/cognitive-services/speech-service/license).**

Jeśli chcesz hostować aplikację na serwerze, musi on wspierać PHP z obsługą curl. Wykonaj poniższe kroki:

* Edytuj plik `token.php`:
  * Zastąp ciąg `YourServiceRegion` regionem usługi swojej subskrypcji.
    Np. zastąp `northeurope` jeśli korzystasz z 30 dniowej próbnej subskrypcji.
  * Zastąp ciąg `YourSubscriptionKey` swoim własnym kluczem subskrypcji.
* Edytuj `index.html` plik:
  * Zastąp wartość zmiennej `authorizationEndpoint` pełnym adresem URL gdzie możesz uzyskać dostęp do zasobu token.php.
* Umieść wszystkie pliki na swoim serwerze.

## Uruchomienie

* Jeśli uruchamiasz aplikację na swoim lokalnym komputerze, otwórz `index.html` z lokalizacji, do której zapisałeś aplikację używając przeglądarki z obsługą Javascript.
  Wpisz do pierwszego pola `Subscription` wartość swojego klucza subskrypcji, rejon usługi jest już predefiniowany.
* W przypadku hostowania aplikacji na serwerze, otwórz przeglądarkę i przejdź do pełnego adresu URL miejsca gdzie hostujesz aplikację.

## Referencje

* [JavaScript quickstart article on the SDK documentation site](https://docs.microsoft.com/azure/cognitive-services/speech-service/quickstart-js-browser)
* [Speech SDK API reference for JavaScript](https://aka.ms/csspeech/javascriptref)
