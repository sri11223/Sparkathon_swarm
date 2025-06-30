# Python Dependencies for AI Services

## System Requirements

- **Python**: 3.11+ (recommended 3.11 or 3.12)
- **pip**: Latest version (usually comes with Python)
- **Operating System**: Windows 10/11, macOS, or Linux

## Core Dependencies

### Web Framework & API
```bash
pip install flask>=2.3.0
pip install flask-cors>=4.0.0
pip install flask-restful>=0.3.10
```

### Environment & Configuration
```bash
pip install python-dotenv>=1.0.0
```

### Data Processing & Analysis
```bash
pip install numpy>=1.24.0
pip install pandas>=2.0.0
pip install scipy>=1.10.0
```

### Machine Learning & AI
```bash
pip install scikit-learn>=1.3.0
pip install tensorflow>=2.13.0
# OR alternatively use PyTorch
pip install torch>=2.0.0
pip install torchvision>=0.15.0
```

### Optimization Libraries
```bash
pip install pulp>=2.7.0
pip install cvxpy>=1.3.0
pip install ortools>=9.7.0
```

### HTTP Requests & API Integration
```bash
pip install requests>=2.31.0
pip install urllib3>=2.0.0
```

### Development & Testing
```bash
pip install pytest>=7.4.0
pip install pytest-flask>=1.2.0
pip install black>=23.0.0
pip install flake8>=6.0.0
```

## Installation Methods

### Method 1: All at Once (Recommended)
```bash
# Navigate to ai-services directory
cd ai-services

# Install all dependencies from requirements.txt
pip install -r requirements.txt
```

### Method 2: Step by Step Installation
```bash
# Core web framework
pip install flask flask-cors flask-restful python-dotenv

# Data processing
pip install numpy pandas scipy

# Machine learning (choose one)
pip install scikit-learn tensorflow
# OR
pip install scikit-learn torch torchvision

# Optimization
pip install pulp cvxpy ortools

# Utilities
pip install requests urllib3

# Development tools
pip install pytest pytest-flask black flake8
```

### Method 3: Using Python Launcher (Windows)
```bash
# If 'pip' command doesn't work, use py launcher
py -m pip install -r requirements.txt

# Or install individually
py -m pip install flask flask-cors flask-restful
py -m pip install numpy pandas scipy
py -m pip install scikit-learn tensorflow
py -m pip install pulp cvxpy ortools
py -m pip install requests urllib3
py -m pip install pytest pytest-flask
```

### Method 4: Virtual Environment (Recommended for Production)
```bash
# Create virtual environment
python -m venv ai-env
# OR
py -m venv ai-env

# Activate virtual environment
# Windows:
ai-env\Scripts\activate
# macOS/Linux:
source ai-env/bin/activate

# Install dependencies
pip install -r requirements.txt

# Deactivate when done
deactivate
```

## Alternative Installation Options

### Using Conda (if available)
```bash
# Create conda environment
conda create -n swarmfill-ai python=3.11

# Activate environment
conda activate swarmfill-ai

# Install packages
conda install flask numpy pandas scipy scikit-learn
pip install flask-cors flask-restful python-dotenv pulp cvxpy ortools
```

### Offline Installation
If you have network issues, download packages manually:

1. Visit [PyPI](https://pypi.org/) and download `.whl` files for each package
2. Install offline:
```bash
pip install package_name.whl --no-deps
```

### Docker Alternative
If Python installation is problematic, use Docker:
```bash
# Build the AI services container
docker build -t swarmfill-ai -f deployment/docker/Dockerfile.ai .

# Run the container
docker run -p 5000:5000 swarmfill-ai
```

## Verification Commands

After installation, verify everything works:

```bash
# Check Python version
python --version

# Check pip version
pip --version

# Test Flask installation
python -c "import flask; print(f'Flask version: {flask.__version__}')"

# Test NumPy installation
python -c "import numpy; print(f'NumPy version: {numpy.__version__}')"

# Test scikit-learn installation
python -c "import sklearn; print(f'Scikit-learn version: {sklearn.__version__}')"

# Test all core packages
python -c "
import flask, numpy, pandas, sklearn, requests
print('✓ All core packages installed successfully')
"
```

## Running the AI Services

Once dependencies are installed:

```bash
# Navigate to ai-services directory
cd ai-services

# Start the Flask server
python main.py

# Or using Python launcher
py main.py

# Or in virtual environment
ai-env\Scripts\activate
python main.py
```

The service should start on `http://localhost:5000`

## Testing the Installation

Test the AI services endpoints:

```bash
# Health check
curl http://localhost:5000/health

# Test warehouse optimization
curl -X POST http://localhost:5000/api/warehouse/optimize \
  -H "Content-Type: application/json" \
  -d "{\"warehouse_id\": \"test\", \"items\": []}"
```

## Common Issues & Solutions

### Issue: "pip is not recognized"
**Solution**: 
```bash
# Use Python launcher
py -m pip install package_name

# Or add Python to PATH and restart terminal
```

### Issue: "Microsoft Visual C++ 14.0 is required"
**Solution**:
```bash
# Install Microsoft C++ Build Tools
# Download from: https://visualstudio.microsoft.com/visual-cpp-build-tools/
```

### Issue: "Failed to build wheel for scipy"
**Solution**:
```bash
# Use pre-compiled wheels
pip install --only-binary=all scipy numpy pandas
```

### Issue: Network/Firewall blocking pip
**Solution**:
```bash
# Use alternative index
pip install --index-url https://pypi.org/simple/ package_name

# Or use corporate proxy
pip install --proxy http://proxy:port package_name

# Or download and install offline (see Offline Installation above)
```

## Minimum Working Setup

If you encounter issues with complex packages, start with minimal setup:

```bash
# Essential packages only
pip install flask flask-cors python-dotenv requests numpy

# This will allow the AI services to start with basic functionality
# Complex ML features can be mocked until full installation is complete
```

## Requirements.txt Content

Here's the exact content that should be in `requirements.txt`:

```
flask>=2.3.0
flask-cors>=4.0.0
flask-restful>=0.3.10
python-dotenv>=1.0.0
numpy>=1.24.0
pandas>=2.0.0
scipy>=1.10.0
scikit-learn>=1.3.0
tensorflow>=2.13.0
pulp>=2.7.0
cvxpy>=1.3.0
ortools>=9.7.0
requests>=2.31.0
urllib3>=2.0.0
pytest>=7.4.0
pytest-flask>=1.2.0
black>=23.0.0
flake8>=6.0.0
```

## Next Steps

1. **Copy this file** to the system where you want to install Python dependencies
2. **Follow Method 1** (install from requirements.txt) for quickest setup
3. **Run verification commands** to ensure everything works
4. **Start the AI services** and test the endpoints
5. **Return to main development** with working AI services

## Support

If you continue to have issues:
- Try the Docker alternative for containerized deployment
- Use the mock AI endpoints in the backend for development
- Focus on frontend/backend development first, add AI services later
