# Shft: διαφοροποίηση και premium που αξίζει

Έλεγχος 16 Σεπτεμβρίου 2026. Read-only επιθεώρηση της εφαρμογής στο `C:/Users/Administrator/Documents/GitHub/Shft/`· κανένα αρχείο εφαρμογής δεν άλλαξε. Πρόκειται για ευρήματα source και στοχευμένα probes, όχι certification πραγματικών συσκευών.

## Μία καθαρή κατεύθυνση

Η Shft δεν χρειάζεται να ανταγωνιστεί με περισσότερα nutrition/social/steps tabs. Να κερδίσει με την επόμενη προπονητική απόφαση, εξηγώντας τα δεδομένα που τη στηρίζουν. Η κύρια υπόσχεση: λιγότερες αποφάσεις, χωρίς να χάνει ο χρήστης τον έλεγχο ή την ιστορία του.

Ο υπάρχων πυρήνας περιλαμβάνει 302 ασκήσεις, custom ασκήσεις, plans/logging, prefill τελευταίας επίδοσης, PRs, trends, weekly insights, recovery estimates και Supabase sync. Δεν ξεκινάμε από μηδενική εφαρμογή.

## Πρώτα η αξιοπιστία

1. **Ενοποίηση release πηγής.** Τα root `preview-app.html`, `www/preview-app.html` και Android bundled HTML έχουν διαφορετικά hashes. Το premium υπάρχει μόνο στο root. Reproducible build και release gate πριν από νέα υπόσχεση λειτουργιών (`capacitor.config.json:4`).
2. **Ασφαλής ιστορία.** Σήμερα το quota retry του `saveState` κόβει progress στις τελευταίες 800 εγγραφές (`preview-app.html:1584`). Μεταφορά σε ανθεκτικό archive, όχι σιωπηλή απώλεια ιστορίας.
3. **Δωρεάν φορητότητα.** Versioned JSON backup και CSV export με units. Import preview με exercise mapping, duplicates και skipped rows πριν από οποιοδήποτε commit. Δεν υπάρχουν import/export actions στο settings (`:4331`, `GATES.md:12`).
4. **Session journal.** Σετ συνδεδεμένα με συγκεκριμένο workout, ημερολόγιο, edit παλιού workout και undo με επανυπολογισμό metrics. Progress και session rows τώρα δεν συνδέονται (`:1627`, `:1637`).
5. **Πραγματικό cold-start offline.** Υπάρχει τοπικό UI/state, αλλά δεν βρέθηκε service worker στα τρία ελεγμένα sources. Να μη συγχέεται η τοπική αποθήκευση με εγγυημένη offline εκκίνηση PWA.

## Καλύτερη προπόνηση, όχι περισσότερα tabs

6. **RIR και set types:** προαιρετικό effort, warm-up/work/failure. Σήμερα session inputs μόνο weight/reps (`:3778`).
7. **Supersets A1/A2:** γύροι, rest μετά το ζευγάρι και unpair. Η copy τα αναφέρει, όχι το schema/session engine (`:1307`, `:2112`, `:5300`).
8. **Rest timer:** deadline timestamp, pause/+30s και σωστό background resume. Υπάρχει restSeconds/editor, όχι εκτελούμενος timer (`:2116`, `:3708`, `:3731`). Το παλιό GATES.md δεν είναι επαρκές τεκμήριο λειτουργίας.
9. **Effort-aware progression:** όλα τα working sets, plan-specific rep range, RIR και πραγματικά διαθέσιμα increments. Τώρα ένα set στο πάνω όριο μπορεί να δώσει bump, και ο helper χρησιμοποιεί library αντί plan range (`:2076`, `:5286`).
10. **Εξηγήσιμο recovery:** εμφανές «εκτίμηση από τα logged sets», προαιρετικό soreness/energy check-in. Τα Fresh labels δεν είναι βιομετρική μέτρηση (`:1947`, `:1963`).
11. **Personal volume ranges:** ανά στόχο, εμπειρία και muscle priority, διακριτά direct/indirect sets. Τα root premium targets είναι fixed (`:4056`, `:4068`).
12. **Αξιόπιστο plateau:** ίδια επίδοση επί εβδομάδες, αβεβαιότητα και εναλλακτικές εξηγήσεις. Probe με οκτώ ίδια training-day bests επέστρεψε null, επειδή latest == all-time best (`plateauFor`, `:4155`).
13. **Μία εβδομαδιαία αλλαγή:** δύο συγκεκριμένα δεδομένα, πρόταση plan diff, accept/skip και αξιολόγηση της προηγούμενης πρότασης. Το υπάρχον deterministic weekly review δεν διατηρεί recommendation history (`:3488`).

## Δύο τίμιες βαθμίδες

| 0$ — πλήρης προπονητικός πυρήνας | 3$/μήνα — συγκεκριμένη καθοδήγηση |
|---|---|
| Unlimited logging/plans, library/custom exercises, PRs και υπάρχοντα charts | Προσωπικά volume ranges με αιτιολόγηση |
| Όλη η ιστορία, offline, account sync, import/export | Effort-aware progression και ελεγμένα plateau signals |
| Rest timer, supersets, RIR και raw weekly sets | Μία εβδομαδιαία αλλαγή με evidence, accept/skip και επανέλεγχο |
| Recovery estimate με ξεκάθαρα όρια | Recommendation history και αξιολόγηση αποτελέσματος |

Ακύρωση χωρίς απώλεια logs, exports, sync ή προηγούμενων αναφορών. Όχι paywall στην ασφάλεια ή φορητότητα δεδομένων. Τα 3$ είναι προτεινόμενη μικτή τιμή πριν από φόρους, store fees και λειτουργικά κόστη· δεν είναι επαληθευμένη πρόβλεψη κερδοφορίας. Αποφυγή ακριβού unlimited AI: deterministic guidance πρώτα, σαφή όρια αν προστεθεί paid inference.

## Αγορές και συσκευές

14. **Verified entitlements:** πραγματική αγορά, restore, cancel/expiry και κοινό account status. Σήμερα client flag και «not available» στο Buy (`:2552`, `:2567`, `:5096`). Χρειάζεται server verification, όχι τοπικό premium toggle. [Google Play backend guidance](https://developer.android.com/google/play/billing/backend), [Apple subscription status API](https://developer.apple.com/documentation/appstoreserverapi/get-all-subscription-statuses).
15. **iOS parity:** Android υπάρχει· δεν βρέθηκε ios project ή @capacitor/ios, μόνο icons/config. Χρήση της ίδιας web βάσης, κατόπιν native lifecycle/accessibility/billing QA. HealthKit/Health Connect αργότερα και opt-in, όχι πριν από αξιόπιστο training loop. [Capacitor](https://capacitorjs.com/docs).

## Τι κρατάμε από τη Relm για τη landing page

- Αληθινό product tour που δείχνει ένα συγκεκριμένο αποτέλεσμα ανά οθόνη, όχι άλλες motivational quotes. [Relm homepage](https://getrelm.app/).
- Περιγραφές data portability με import preview, units, duplicates και αμετάβλητο original. Να δημοσιευτούν στη Shft μόνο αφού υλοποιηθούν. [Move to Relm](https://getrelm.app/move-to-relm/).
- Ξεκάθαρη έκδοση/διαθεσιμότητα και λίγα συγκεκριμένα release highlights. [Relm updates](https://getrelm.app/updates/).
- Support που απαντά πρακτικές απορίες και contact που λειτουργεί. [Relm support](https://getrelm.app/support/).
- Health privacy που εξηγεί categories, purposes και τι αφήνει τη συσκευή — με πραγματικές Shft ρυθμίσεις, όχι αντιγραφή. [Relm health-data notice](https://getrelm.app/consumer-health-data/).

Ελέγχθηκαν οι δημόσιες homepage/support/privacy/terms/health-data/import/updates σελίδες. Δεν έγινε πλήρης crawl του εξωτερικού web, private app screens ή υποβολή forms. Δεν αντιγράφηκαν κείμενα ή media της Relm.
