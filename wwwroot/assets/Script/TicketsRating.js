(function () {
    "use strict";

    function showHeaderMessage(msg, isError) {
        var el = document.getElementById("ratingHeaderMessage");
        if (!el) return;

        el.textContent = msg;
        el.style.backgroundColor = isError ? "#dc3545" : "#28a745";
        el.style.display = "inline-block";

        setTimeout(function () {
            el.style.display = "none";
        }, 3000);
    }
    // ========== STEP 1: URL se query params nikaalna (op = Y ya N) ==========
    function getQueryParams() {
        var params = new URLSearchParams(window.location.search);
        return {
            companyCode: params.get("CompanyCode") || "",
            clientEmail: params.get("ClientEmail") || "",
            ticketCode: params.get("Code") || "",
            op: params.get("op") || ""   // "Y" = satisfied → rating 10, Complete | "N" = not satisfied → rating 0, Pending
        };
    }

    function getBaseUrl() {
        return window.location.origin;
    }

    // ========== STEP 2a: op = "Y" → Rating 10, Status Complete set karo ==========
    function applyOpY(elements) {
        if (elements.statusSelect) elements.statusSelect.value = "C";
        if (elements.ratingInput) {
            elements.ratingInput.value = 10;
            if (elements.ratingValue) elements.ratingValue.textContent = "10";
        }
    }

    // ========== STEP 2b: op = "N" → Rating 0, Status Pending set karo ==========
    function applyOpN(elements) {
        if (elements.statusSelect) elements.statusSelect.value = "P";
        if (elements.ratingInput) {
            elements.ratingInput.value = 0;
            if (elements.ratingValue) elements.ratingValue.textContent = "0";
        }
    }

    // ========== STEP 3: Server se ticket data load karo, phir op ke hisaab se rating/status set karo ==========
    function loadTicketData(qs, elements) {
        if (!qs.companyCode || !qs.ticketCode || !qs.clientEmail) return;

        var url = getBaseUrl() + "/Login/GetTicketRatingData"
            + "?companyCode=" + encodeURIComponent(qs.companyCode)
            + "&Code=" + encodeURIComponent(qs.ticketCode)
            + "&clientEmail=" + encodeURIComponent(qs.clientEmail)
            + "&type=" + encodeURIComponent(qs.op || "");

        fetch(url, { method: "GET" })
            .then(function (res) { return res.json(); })
            .then(function (data) {
                if (!data || data.success === false) {
                    console.error(data && data.message ? data.message : "Ticket load error");
                    setDefaultByOp(qs.op, elements);
                    return;
                }
                if (elements.txtTicketNo) elements.txtTicketNo.value = data.ticketNo || "";
                if (elements.txtQueryDesc) elements.txtQueryDesc.value = data.queryDescription || "";
                if (qs.op === "Y") {
                    applyOpY(elements);
                    if (elements.ratingInput && data.rating != null) {
                        elements.ratingInput.value = data.rating;
                        if (elements.ratingValue) elements.ratingValue.textContent = data.rating;
                    }
                    autoSaveRating(elements);
                } else if (qs.op === "N") {
                    applyOpN(elements);
                    if (elements.ratingInput && data.rating != null) {
                        elements.ratingInput.value = data.rating;
                        if (elements.ratingValue) elements.ratingValue.textContent = data.rating;
                    }
                } else {
                    setDefaultByOp(qs.op, elements);
                }
            })
            .catch(function (err) {
                setDefaultByOp(qs.op, elements);
            });
    }

    function setDefaultByOp(op, elements) {
        if (op === "Y") applyOpY(elements);
        else if (op === "N") applyOpN(elements);
        else applyOpY(elements);
    }

    // ========== STEP 3b: op = "Y" → Auto save (Status Complete, Rating 10), phir message dikhao ==========
    function autoSaveRating(elements, callback) {
        if (!elements.frmTicketRating) return;
        var companyCode = elements.companyCodeHidden ? elements.companyCodeHidden.value.trim() : "";
        if (!companyCode) {
            if (callback) callback(false, "Company code missing.");
            return;
        }
        var ticketNo = elements.txtTicketNo ? elements.txtTicketNo.value.trim() : "";
        if (!ticketNo) {
            if (callback) callback(false, "Ticket no missing.");
            return;
        }
        applyOpY(elements);
        if (elements.remark) elements.remark.value = "Satisfied";
        elements.frmTicketRating.setAttribute("data-autosave-attempted", "1");
        var formData = new FormData(elements.frmTicketRating);
        var body = new URLSearchParams(formData).toString();
        var actionUrl = elements.frmTicketRating.action || (getBaseUrl() + "/Login/TicketsRating");

        fetch(actionUrl, {
            method: "POST",
            body: body,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "X-Requested-With": "XMLHttpRequest"
            }
        })
            .then(function (res) {
                if (!res.ok) {
                    return res.text().then(function (t) {
                        throw new Error("Server " + res.status + (t ? ": " + t.substring(0, 100) : ""));
                    });
                }
                return res.json();
            })
            .then(function (data) {
                if (data && data.success) {
                    if (elements.frmTicketRating) elements.frmTicketRating.setAttribute("data-autosaved", "1");
                    var msg = data.message || "Rating send successfully.";
                    // Sirf page ke andar green message dikhaye
                    showHeaderMessage(msg, true);
                    if (elements.remark) elements.remark.value = "";
                    var btnSubmit = document.getElementById("btnSubmitRating");
                    if (btnSubmit) {
                        btnSubmit.disabled = true;
                        btnSubmit.textContent = " Saved ";
                    }
                    if (callback) callback(true, data.message);
                } else {
                    var errMsg = (data && data.message) ? data.message : "Something went wrong.";
                    showHeaderMessage(errMsg, false);
                    if (callback) callback(false, errMsg);
                }
            })
            .catch(function (err) {
                console.error("Auto-save error", err);
                showHeaderMessage("Request fail: " + (err.message || ""), false);
                if (callback) callback(false, err.message);
            });
    }
    // ========== STEP 5: Reset button — op ke hisaab se rating/status reset ==========
    function setupResetButton(elements, op) {
        if (!elements.btnClear) return;

        // op na Y na N ho to reset bhi disable (sirf view)
        if (op !== "Y" && op !== "N") {
            elements.btnClear.disabled = true;
            return;
        }

        elements.btnClear.addEventListener("click", function () {
            if (op === "Y") {
                applyOpY(elements);
            } else {
                applyOpN(elements);
            }
            if (elements.remark) elements.remark.value = "";
        });
    }

    // ========== STEP 6: Form submit — op Y/N ke hisaab se; baaki sirf view ==========
    function setupFormSubmit(elements, op) {
        if (!elements.frmTicketRating) return;

        elements.frmTicketRating.addEventListener("submit", function (e) {
            e.preventDefault();

            var companyCode = elements.companyCodeHidden ? elements.companyCodeHidden.value.trim() : "";
            if (!companyCode) {
                showHeaderMessage("Company code missing. Is page ko rating link se open karein (email link).", true);
                return;
            }

            // op=Y → submit se pehle Rating 10, Status C force
            if (op === "Y") {
                applyOpY(elements);
            }
            // op=N → submit se pehle Rating 0, Status P force
            if (op === "N") {
                applyOpN(elements);
            }

            var remarkVal = elements.remark ? elements.remark.value.trim() : "";
            // op = Y  → remark optional
            // op = N  → remark mandatory
            if (op === "N" && !remarkVal) {
                showHeaderMessage("Remark is mandatory. Please enter remark.", true);
                if (elements.remark) elements.remark.focus();
                return;
            }

            var btnSubmit = document.getElementById("btnSubmitRating");
            if (btnSubmit) {
                btnSubmit.disabled = true;
                btnSubmit.textContent = " Saving... ";
            }

            var formData = new FormData(elements.frmTicketRating);
            var body = new URLSearchParams(formData).toString();
            var actionUrl = elements.frmTicketRating.action || (getBaseUrl() + "/Login/TicketsRating");

            fetch(actionUrl, {
                method: "POST",
                body: body,
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "X-Requested-With": "XMLHttpRequest"
                }
            })
                .then(function (res) {
                    if (!res.ok) {
                        return res.text().then(function (t) {
                            throw new Error("Server " + res.status + (t ? ": " + t.substring(0, 100) : ""));
                        });
                    }
                    return res.json();
                })
                .then(function (data) {
                    if (data && data.success) {
                        // Sirf page ke andar success message dikhaye
                        showHeaderMessage(data.message, true);
                        if (elements.remark) elements.remark.value = "";
                    } else {
                        var errMsg = (data && data.message) ? data.message : "Something went wrong.";
                        showHeaderMessage(errMsg, false);
                    }
                })
                .catch(function (err) {
                    console.error("Submit error", err);
                    // Error bhi page ke andar hi dikhaye
                    showHeaderMessage("Request fail: " + (err.message || "Server se response nahi aaya."), false);
                })
                .finally(function () {
                    if (btnSubmit) {
                        btnSubmit.disabled = false;
                        btnSubmit.innerHTML = "<span class=\"btn-icon\">✓</span> Submit rating";
                    }
                });
        });
    }

    // ========== STEP 7: Slider chip sync ==========
    function setupSliderSync(elements) {
        if (!elements.ratingInput || !elements.ratingValue) return;
        elements.ratingValue.textContent = elements.ratingInput.value;
        elements.ratingInput.addEventListener("input", function () {
            elements.ratingValue.textContent = elements.ratingInput.value;
        });
    }

    // ========== MAIN INIT: Step by step run karo ==========
    function init() {
        var elements = {
            ratingInput: document.getElementById("rating"),
            ratingValue: document.getElementById("ratingValue"),
            btnClear: document.getElementById("btnClear"),
            remark: document.getElementById("remark"),
            frmTicketRating: document.getElementById("frmTicketRating"),
            companyCodeHidden: document.getElementById("CompanyCode"),
            typeHidden: document.getElementById("Type"),
            txtRatingBy: document.getElementById("txtRatingBy"),
            txtTicketNo: document.getElementById("txtTicketNo"),
            txtQueryDesc: document.getElementById("txtQueryDesc"),
            statusSelect: document.getElementById("status")
        };

        // Step 1: Query params
        var qs = getQueryParams();

        // Hidden fields for form submit
        if (elements.companyCodeHidden) elements.companyCodeHidden.value = qs.companyCode;
        if (elements.typeHidden) elements.typeHidden.value = qs.op || "";

        if (elements.txtRatingBy && qs.clientEmail) elements.txtRatingBy.value = qs.clientEmail;

        // Step 2 & 3: op Y/N ke hisaab se rating/status + ticket data load
        if (qs.op === "Y") {
            applyOpY(elements);
        } else if (qs.op === "N") {
            applyOpN(elements);
        } else {
            // op empty hone par status "Select status" (blank) pe rakhna hai
            if (elements.statusSelect) {
                elements.statusSelect.value = "";
            }
        }
        loadTicketData(qs, elements);

        // op=Y: 2.5 sec baad ek baar phir auto-save try karo (agar pehle nahi chala / slow API)
        if (qs.op === "Y") {
            setTimeout(function () {
                var form = elements.frmTicketRating;
                if (!form || form.getAttribute("data-autosaved") === "1") return;
                var companyCode = elements.companyCodeHidden ? elements.companyCodeHidden.value.trim() : "";
                var ticketNo = elements.txtTicketNo ? elements.txtTicketNo.value.trim() : "";
                if (companyCode && ticketNo) {
                    autoSaveRating(elements);
                }
            }, 2500);
        }
 
        // Step 4: Slider chip sync
        setupSliderSync(elements);

        // Step 5: Reset button
        setupResetButton(elements, qs.op);

        // Step 6: Form submit (remark mandatory, op Y/N ke hisaab save)
        setupFormSubmit(elements, qs.op);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
