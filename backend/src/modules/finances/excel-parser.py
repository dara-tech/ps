import sys
import os
import zipfile
import xml.etree.ElementTree as ET
import json
import re

def parse_excel_statement(file_path):
    if not os.path.exists(file_path):
        return {"error": f"File not found: {file_path}"}

    try:
        with zipfile.ZipFile(file_path) as z:
            # 1. Read shared strings
            shared_strings = []
            if 'xl/sharedStrings.xml' in z.namelist():
                tree = ET.fromstring(z.read('xl/sharedStrings.xml'))
                for elem in tree.iter('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}si'):
                    t_elems = elem.findall('.//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t')
                    shared_strings.append(''.join([t.text for t in t_elems if t.text]))

            # 2. Read sheet1
            tree = ET.fromstring(z.read('xl/worksheets/sheet1.xml'))
            rows = []
            for row in tree.iter('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}row'):
                row_vals = []
                for cell in row.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}c'):
                    t = cell.get('t')
                    v = cell.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}v')
                    val = v.text if v is not None else ''
                    if t == 's' and val:
                        try:
                            val = shared_strings[int(val)]
                        except:
                            pass
                    row_vals.append(str(val).strip())
                if any(row_vals):
                    rows.append(row_vals)

            # Look for header row
            header_idx = -1
            account_name = ""
            account_number = ""
            total_income_stated = 0.0
            total_expense_stated = 0.0
            currency = "USD"

            for idx, r in enumerate(rows):
                r_str = ' '.join(r)
                if 'ឈ្មោះគណនី' in r_str or 'Account Name' in r_str:
                    account_name = r[1] if len(r) > 1 else ""
                if 'លេខគណនី' in r_str or 'Account Number' in r_str:
                    account_number = r[1] if len(r) > 1 else ""
                if 'រូបិយប័ណ្ណ' in r_str:
                    currency = r[1] if len(r) > 1 else "USD"
                if 'ចំនួនទឹកប្រាក់ចូលសរុប' in r_str and len(r) > 4:
                    num_match = re.search(r'[\d,.]+', r[4])
                    if num_match:
                        total_income_stated = float(num_match.group(0).replace(',', ''))
                if 'ចំនួនទឹកប្រាក់ចេញសរុប' in r_str and len(r) > 4:
                    num_match = re.search(r'[\d,.]+', r[4])
                    if num_match:
                        total_expense_stated = float(num_match.group(0).replace(',', ''))

                if 'កាលបរិច្ឆេទ' in r_str or 'Date' in r_str or ('ចំនួនទឹកប្រាក់ចេញ' in r_str and 'បរិយាយ' in r_str):
                    header_idx = idx
                    break

            transactions = []
            if header_idx != -1:
                for r in rows[header_idx+1:]:
                    if len(r) < 3:
                        continue
                    date_str = r[0] if len(r) > 0 else ''
                    desc_str = r[1] if len(r) > 1 else ''
                    expense_str = r[2] if len(r) > 2 else ''
                    income_str = r[3] if len(r) > 3 else ''

                    exp_clean = re.sub(r'[^\d.]', '', expense_str)
                    inc_clean = re.sub(r'[^\d.]', '', income_str)

                    exp_val = float(exp_clean) if exp_clean else 0.0
                    inc_val = float(inc_clean) if inc_clean else 0.0

                    if exp_val == 0.0 and inc_val == 0.0:
                        continue

                    t_type = 'expense' if exp_val > 0 else 'income'
                    amount = exp_val if exp_val > 0 else inc_val

                    # Intelligent categorization
                    desc_upper = desc_str.upper()
                    category = 'General'
                    if any(k in desc_upper for k in ['LUCKY', 'FOOD', 'RESTAURANT', 'COFFEE', 'CAFE', 'BAKERY', 'MART', 'SUPERMARKET', 'MARKET', 'LUNCH', 'DINNER', 'BURGER', 'PIZZA']):
                        category = 'Food & Groceries'
                    elif any(k in desc_upper for k in ['SALARY', 'PAYROLL', 'INCOME', 'DEPOSIT', 'TOPUP', 'INTEREST']):
                        category = 'Income'
                    elif any(k in desc_upper for k in ['PETROL', 'CALTEX', 'TOTAL', 'GAS', 'TRANSPORT', 'GRAB', 'PASSAPP', 'TAXI', 'PARKING']):
                        category = 'Transportation'
                    elif any(k in desc_upper for k in ['KHQR', 'TRANSFER', 'PAID TO', 'SEND TO', 'ABA', 'ACLEDA', 'WING', 'CANADIA', 'PAYMENT']):
                        category = 'Transfer & Payments'
                    elif any(k in desc_upper for k in ['HOTEL', 'FLIGHT', 'TRIP', 'TRAVEL', 'AIRBNB', 'RESORT']):
                        category = 'Travel & Leisure'
                    elif any(k in desc_upper for k in ['BILL', 'ELECTRIC', 'WATER', 'INTERNET', 'WIFI', 'MOBILE', 'PHONE', 'CELLCARD', 'SMART']):
                        category = 'Utilities & Bills'
                    elif any(k in desc_upper for k in ['PHARMACY', 'CLINIC', 'HOSPITAL', 'HEALTH', 'DOCTOR', 'MEDICINE']):
                        category = 'Healthcare'

                    transactions.append({
                        "date": date_str,
                        "note": desc_str,
                        "amount": amount,
                        "type": t_type,
                        "category": category
                    })

            return {
                "success": True,
                "accountName": account_name.replace(':', '').strip(),
                "accountNumber": account_number.replace(':', '').strip(),
                "currency": currency.replace(':', '').strip(),
                "totalCount": len(transactions),
                "totalIncomeStated": total_income_stated,
                "totalExpenseStated": total_expense_stated,
                "transactions": transactions
            }
    except Exception as e:
        return {"error": str(e)}

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No file path provided"}))
        sys.exit(1)
    
    file_path = sys.argv[1]
    res = parse_excel_statement(file_path)
    print(json.dumps(res, ensure_ascii=False))
