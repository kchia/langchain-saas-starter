#!/usr/bin/env python3
"""
Notebook Setup Verification Script
Checks all dependencies needed to run Task 5 evaluation notebook
"""

import sys
import os
from pathlib import Path
import json
from typing import Dict, List, Tuple
import subprocess

# Color codes for output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'


def check_mark(passed: bool) -> str:
    """Return colored checkmark or X"""
    return f"{GREEN}✅{RESET}" if passed else f"{RED}❌{RESET}"


def warning_mark() -> str:
    """Return warning symbol"""
    return f"{YELLOW}⚠️{RESET}"


class SetupVerifier:
    def __init__(self):
        self.project_root = Path.cwd()
        if self.project_root.name == 'utils':
            self.project_root = self.project_root.parent.parent
        elif self.project_root.name == 'notebooks':
            self.project_root = self.project_root.parent

        self.results = {
            'passed': [],
            'failed': [],
            'warnings': []
        }

    def run_all_checks(self):
        """Run all verification checks"""
        print(f"\n{BLUE}{'='*80}{RESET}")
        print(f"{BLUE}ComponentForge - Notebook Setup Verification{RESET}")
        print(f"{BLUE}{'='*80}{RESET}\n")

        # 1. Check Python environment
        self.check_python_environment()

        # 2. Check Python packages
        self.check_python_packages()

        # 3. Check Docker services
        self.check_docker_services()

        # 4. Check data files
        self.check_data_files()

        # 5. Check backend modules
        self.check_backend_modules()

        # 6. Check environment variables
        self.check_environment_variables()

        # 7. Check validator scripts
        self.check_validator_scripts()

        # Print summary
        self.print_summary()

        return len(self.results['failed']) == 0

    def check_python_environment(self):
        """Check Python version and virtual environment"""
        print(f"\n{BLUE}[1] Python Environment{RESET}")
        print("-" * 40)

        # Python version
        version = sys.version_info
        version_str = f"{version.major}.{version.minor}.{version.micro}"
        python_ok = version.major == 3 and version.minor >= 11

        print(f"{check_mark(python_ok)} Python version: {version_str}")
        if python_ok:
            self.results['passed'].append("Python 3.11+")
        else:
            self.results['failed'].append(f"Python 3.11+ (found {version_str})")

        # Virtual environment
        venv_path = self.project_root / 'backend' / 'venv'
        venv_exists = venv_path.exists()
        print(f"{check_mark(venv_exists)} Virtual environment: {venv_path}")

        if venv_exists:
            self.results['passed'].append("Virtual environment")
        else:
            self.results['failed'].append("Virtual environment at backend/venv")

    def check_python_packages(self):
        """Check required Python packages"""
        print(f"\n{BLUE}[2] Python Packages{RESET}")
        print("-" * 40)

        required_packages = {
            'jupyter': 'Jupyter notebook support',
            'pandas': 'Data analysis',
            'numpy': 'Numerical computing',
            'matplotlib': 'Plotting',
            'seaborn': 'Statistical visualizations',
            'plotly': 'Interactive charts',
            'scipy': 'Statistical tests',
            'langchain': 'LLM framework',
            'langchain-openai': 'OpenAI integration',
            'openai': 'OpenAI API',
            'qdrant-client': 'Vector database client'
        }

        for package, description in required_packages.items():
            try:
                __import__(package.replace('-', '_'))
                print(f"{check_mark(True)} {package:20} - {description}")
                self.results['passed'].append(f"Package: {package}")
            except ImportError:
                print(f"{check_mark(False)} {package:20} - {description}")
                self.results['failed'].append(f"Package: {package}")

    def check_docker_services(self):
        """Check Docker services status"""
        print(f"\n{BLUE}[3] Docker Services{RESET}")
        print("-" * 40)

        # Check docker-compose.yml
        compose_file = self.project_root / 'docker-compose.yml'
        compose_exists = compose_file.exists()
        print(f"{check_mark(compose_exists)} docker-compose.yml: {compose_file}")

        if compose_exists:
            self.results['passed'].append("docker-compose.yml")
        else:
            self.results['failed'].append("docker-compose.yml")

        # Check if Docker is running
        try:
            result = subprocess.run(
                ['docker', 'ps'],
                capture_output=True,
                text=True,
                timeout=5
            )
            docker_running = result.returncode == 0
        except (subprocess.TimeoutExpired, FileNotFoundError):
            docker_running = False

        print(f"{check_mark(docker_running)} Docker daemon: {'running' if docker_running else 'not running'}")

        if docker_running:
            self.results['passed'].append("Docker daemon")

            # Check specific services
            services = ['postgres', 'qdrant', 'redis']
            try:
                result = subprocess.run(
                    ['docker-compose', 'ps', '--services', '--filter', 'status=running'],
                    capture_output=True,
                    text=True,
                    timeout=5,
                    cwd=str(self.project_root)
                )
                running_services = result.stdout.strip().split('\n') if result.stdout.strip() else []

                for service in services:
                    is_running = service in running_services
                    status = 'running' if is_running else 'stopped'
                    print(f"  {check_mark(is_running)} {service}: {status}")

                    if is_running:
                        self.results['passed'].append(f"Service: {service}")
                    else:
                        self.results['warnings'].append(f"Service: {service} (not running)")
            except (subprocess.TimeoutExpired, FileNotFoundError):
                print(f"  {warning_mark()} Could not check service status")
                self.results['warnings'].append("Docker service status check failed")
        else:
            self.results['failed'].append("Docker daemon")

    def check_data_files(self):
        """Check required data files"""
        print(f"\n{BLUE}[4] Data Files{RESET}")
        print("-" * 40)

        # Check patterns directory
        patterns_dir = self.project_root / 'backend' / 'data' / 'patterns'
        patterns_exist = patterns_dir.exists()

        if patterns_exist:
            pattern_files = list(patterns_dir.glob('*.json'))
            print(f"{check_mark(True)} Patterns directory: {patterns_dir}")
            print(f"  Found {len(pattern_files)} pattern files")

            if len(pattern_files) >= 10:
                self.results['passed'].append(f"Pattern files ({len(pattern_files)})")
            else:
                self.results['warnings'].append(f"Pattern files ({len(pattern_files)}, expected ≥10)")
        else:
            print(f"{check_mark(False)} Patterns directory: {patterns_dir}")
            self.results['failed'].append("Patterns directory")

        # Check exemplars directory
        exemplars_dir = self.project_root / 'backend' / 'data' / 'exemplars'
        exemplars_exist = exemplars_dir.exists()

        if exemplars_exist:
            exemplar_dirs = [d for d in exemplars_dir.iterdir() if d.is_dir()]
            print(f"{check_mark(True)} Exemplars directory: {exemplars_dir}")
            print(f"  Found {len(exemplar_dirs)} exemplar directories")
            self.results['passed'].append(f"Exemplar files ({len(exemplar_dirs)})")
        else:
            print(f"{check_mark(False)} Exemplars directory: {exemplars_dir}")
            self.results['warnings'].append("Exemplars directory (optional)")

    def check_backend_modules(self):
        """Check backend Python modules"""
        print(f"\n{BLUE}[5] Backend Modules{RESET}")
        print("-" * 40)

        backend_src = self.project_root / 'backend' / 'src'

        modules_to_check = {
            'retrieval': ['bm25_retriever.py', 'semantic_retriever.py', 'weighted_fusion.py'],
            'generation': ['generator_service.py', 'llm_generator.py', 'code_validator.py'],
            'validation': []  # validation module structure
        }

        for module_name, expected_files in modules_to_check.items():
            module_dir = backend_src / module_name
            module_exists = module_dir.exists()

            if module_exists:
                files_found = list(module_dir.glob('*.py'))
                print(f"{check_mark(True)} {module_name:15} - {len(files_found)} Python files")
                self.results['passed'].append(f"Module: {module_name}")

                # Check for specific files
                for expected_file in expected_files:
                    file_path = module_dir / expected_file
                    file_exists = file_path.exists()
                    if file_exists:
                        print(f"  {check_mark(True)} {expected_file}")
                    else:
                        print(f"  {check_mark(False)} {expected_file}")
                        self.results['warnings'].append(f"File: {module_name}/{expected_file}")
            else:
                print(f"{check_mark(False)} {module_name:15} - directory not found")
                self.results['failed'].append(f"Module: {module_name}")

        # Check for HybridRetriever class
        print(f"\n  Looking for HybridRetriever class...")
        hybrid_found = False

        retrieval_dir = backend_src / 'retrieval'
        if retrieval_dir.exists():
            for py_file in retrieval_dir.glob('*.py'):
                content = py_file.read_text()
                if 'class HybridRetriever' in content or 'HybridRetriever' in content:
                    hybrid_found = True
                    print(f"  {check_mark(True)} Found in {py_file.name}")
                    break

        if not hybrid_found:
            print(f"  {warning_mark()} HybridRetriever class not found")
            print(f"     Note: Notebook can create wrapper using existing modules")
            self.results['warnings'].append("HybridRetriever class (will use weighted_fusion)")

    def check_environment_variables(self):
        """Check environment variables"""
        print(f"\n{BLUE}[6] Environment Variables{RESET}")
        print("-" * 40)

        env_file = self.project_root / 'backend' / '.env'
        env_exists = env_file.exists()

        print(f"{check_mark(env_exists)} .env file: {env_file}")

        if env_exists:
            self.results['passed'].append(".env file")

            # Read and check for required variables
            required_vars = ['OPENAI_API_KEY', 'DATABASE_URL', 'QDRANT_URL']
            env_content = env_file.read_text()

            for var in required_vars:
                # Check if variable is defined (not empty)
                has_var = var in env_content
                if has_var:
                    # Check if it has a value (not just commented out)
                    lines = [l for l in env_content.split('\n') if l.strip() and not l.strip().startswith('#')]
                    has_value = any(l.startswith(var) and '=' in l for l in lines)

                    print(f"  {check_mark(has_value)} {var}")
                    if has_value:
                        self.results['passed'].append(f"Env var: {var}")
                    else:
                        self.results['warnings'].append(f"Env var: {var} (defined but may be empty)")
                else:
                    print(f"  {check_mark(False)} {var}")
                    self.results['warnings'].append(f"Env var: {var}")
        else:
            self.results['failed'].append(".env file")

    def check_validator_scripts(self):
        """Check validator scripts"""
        print(f"\n{BLUE}[7] Validator Scripts{RESET}")
        print("-" * 40)

        # TypeScript validator
        ts_validator = self.project_root / 'backend' / 'scripts' / 'validate_typescript.js'
        ts_exists = ts_validator.exists()
        print(f"{check_mark(ts_exists)} TypeScript validator: {ts_validator}")

        if ts_exists:
            self.results['passed'].append("TypeScript validator")
        else:
            self.results['failed'].append("TypeScript validator")

        # Token validator
        token_validator = self.project_root / 'app' / 'src' / 'services' / 'validation' / 'token-validator.ts'
        token_exists = token_validator.exists()
        print(f"{check_mark(token_exists)} Token validator: {token_validator}")

        if token_exists:
            self.results['passed'].append("Token validator")
        else:
            self.results['failed'].append("Token validator")

    def print_summary(self):
        """Print verification summary"""
        print(f"\n{BLUE}{'='*80}{RESET}")
        print(f"{BLUE}Summary{RESET}")
        print(f"{BLUE}{'='*80}{RESET}\n")

        total_passed = len(self.results['passed'])
        total_failed = len(self.results['failed'])
        total_warnings = len(self.results['warnings'])

        print(f"{GREEN}✅ Passed: {total_passed}{RESET}")
        print(f"{RED}❌ Failed: {total_failed}{RESET}")
        print(f"{YELLOW}⚠️  Warnings: {total_warnings}{RESET}\n")

        if total_failed > 0:
            print(f"{RED}Failed Checks:{RESET}")
            for item in self.results['failed']:
                print(f"  ❌ {item}")
            print()

        if total_warnings > 0:
            print(f"{YELLOW}Warnings:{RESET}")
            for item in self.results['warnings']:
                print(f"  ⚠️  {item}")
            print()

        # Overall status
        if total_failed == 0:
            if total_warnings == 0:
                print(f"{GREEN}✅ All checks passed! Notebook is ready to run.{RESET}\n")
            else:
                print(f"{YELLOW}⚠️  Notebook can run, but some optional features may not work.{RESET}\n")
        else:
            print(f"{RED}❌ Some critical checks failed. See missing dependencies below.{RESET}\n")

        # Print what's missing
        self.print_missing_dependencies()

    def print_missing_dependencies(self):
        """Print detailed report of missing dependencies"""
        if len(self.results['failed']) == 0 and len(self.results['warnings']) == 0:
            return

        print(f"{BLUE}{'='*80}{RESET}")
        print(f"{BLUE}Missing Dependencies & Recommendations{RESET}")
        print(f"{BLUE}{'='*80}{RESET}\n")

        # Group by category
        missing_packages = [f for f in self.results['failed'] if f.startswith('Package:')]
        missing_services = [f for f in self.results['failed'] if f.startswith('Service:')]
        missing_modules = [f for f in self.results['failed'] if f.startswith('Module:')]
        missing_files = [f for f in self.results['failed'] if not any(f.startswith(p) for p in ['Package:', 'Service:', 'Module:'])]

        if missing_packages:
            print(f"{RED}Missing Python Packages:{RESET}")
            packages = [p.replace('Package: ', '') for p in missing_packages]
            print(f"  Install with: cd backend && source venv/bin/activate && pip install {' '.join(packages)}\n")

        if missing_services or any('Service:' in w for w in self.results['warnings']):
            print(f"{YELLOW}Docker Services Not Running:{RESET}")
            print(f"  Start with: docker-compose up -d")
            print(f"  This will start: PostgreSQL, Qdrant, Redis\n")

        if missing_modules:
            print(f"{RED}Missing Backend Modules:{RESET}")
            for module in missing_modules:
                print(f"  ❌ {module}")
            print(f"  These modules should exist in backend/src/\n")

        if 'HybridRetriever class (will use weighted_fusion)' in self.results['warnings']:
            print(f"{YELLOW}Note: HybridRetriever wrapper{RESET}")
            print(f"  The notebook will create a HybridRetriever wrapper using:")
            print(f"    - bm25_retriever.py (BM25 lexical search)")
            print(f"    - semantic_retriever.py (Vector embeddings)")
            print(f"    - weighted_fusion.py (Hybrid fusion)")
            print(f"  This is normal and expected.\n")

        if missing_files:
            print(f"{RED}Missing Files:{RESET}")
            for file in missing_files:
                print(f"  ❌ {file}")
            print()

        # Quick start guide
        print(f"{BLUE}Quick Start:{RESET}")
        print(f"  1. Install missing packages: cd backend && source venv/bin/activate && pip install jupyter pandas numpy matplotlib seaborn plotly scipy")
        print(f"  2. Start Docker services: docker-compose up -d")
        print(f"  3. Launch notebook: cd notebooks/evaluation && jupyter notebook task5_golden_dataset_rag_evaluation.ipynb")
        print()


def main():
    """Main entry point"""
    verifier = SetupVerifier()
    success = verifier.run_all_checks()
    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()
