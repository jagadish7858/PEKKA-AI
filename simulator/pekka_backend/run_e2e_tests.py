import os
import sys
import pytest

if __name__ == "__main__":
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    os.environ["PYTHONPATH"] = backend_dir
    test_file = os.path.join(backend_dir, "tests", "test_sensor_to_ai_e2e.py")
    
    print("=" * 70)
    print("  PEKKA AI CRITICAL INFRASTRUCTURE — END-TO-END INTEGRATION TEST")
    print("=" * 70)
    
    ret_code = pytest.main([test_file, "-v", "-s"])
    
    print("\n" + "=" * 70)
    if ret_code == 0:
        print("  ALL 11 END-TO-END PIPELINE TESTS PASSED SUCCESSFULLY! [PASS]")
    else:
        print(f"  INTEGRATION TESTS FINISHED WITH CODE: {ret_code} [FAIL]")
    print("=" * 70)
    sys.exit(ret_code)
